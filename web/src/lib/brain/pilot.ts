import "server-only";
import { createWalletClient, decodeEventLog, http, hexToString, toHex, type Address, type Hex, type Log } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { MEZO, PILOT_ADDRESS, mezoTestnet, publicClient } from "@/lib/mezo/chain";
import { erc20Abi, veAbi } from "@/lib/mezo/abis";
import { pilotAbi } from "@/lib/mezo/pilotAbi";
import { buildCore, finalize, type Plan, type PolicyInput } from "./plan";
import { snapshotMarket, snapshotNft, type MarketSnapshot } from "./snapshot";

export type OnchainPolicy = {
  maxPoolShareBps: number;
  boostShareBps: number;
  minPools: number;
  autoSave: boolean;
  epochPullCap: bigint;
};

export type Enrollment = { owner: Address; enrolledAt: number; active: boolean; policy: OnchainPolicy };

export function pilotAddress(): Address {
  if (!PILOT_ADDRESS) throw new Error("NEXT_PUBLIC_PILOT_ADDRESS is not set");
  return PILOT_ADDRESS as Address;
}

export function toPolicyInput(p: OnchainPolicy): PolicyInput {
  return {
    cap: p.maxPoolShareBps / 10_000,
    minPools: p.minPools,
    boostShare: p.boostShareBps / 10_000,
    autoSave: p.autoSave,
  };
}

export async function readEnrollment(tokenId: bigint): Promise<{ enrollment: Enrollment; live: boolean } | null> {
  if (!PILOT_ADDRESS) return null;
  const c = publicClient();
  const [e, live] = await Promise.all([
    c.readContract({ address: pilotAddress(), abi: pilotAbi, functionName: "enrollment", args: [tokenId] }),
    c.readContract({ address: pilotAddress(), abi: pilotAbi, functionName: "isLive", args: [tokenId] }),
  ]);
  const en = e as unknown as { owner: Address; enrolledAt: bigint; active: boolean; policy: OnchainPolicy };
  if (en.owner === "0x0000000000000000000000000000000000000000") return null;
  return {
    enrollment: {
      owner: en.owner,
      enrolledAt: Number(en.enrolledAt),
      active: en.active,
      policy: {
        maxPoolShareBps: Number(en.policy.maxPoolShareBps),
        boostShareBps: Number(en.policy.boostShareBps),
        minPools: Number(en.policy.minPools),
        autoSave: en.policy.autoSave,
        epochPullCap: BigInt(en.policy.epochPullCap),
      },
    },
    live: live as boolean,
  };
}

/** MUSD the pilot could compound right now: owner balance, allowance and the epoch cap all bind. */
export async function compoundableMusd(tokenId: bigint, owner: Address): Promise<bigint> {
  if (!PILOT_ADDRESS) return 0n;
  const c = publicClient();
  const [bal, allowance, remaining] = await Promise.all([
    c.readContract({ address: MEZO.musd, abi: erc20Abi, functionName: "balanceOf", args: [owner] }),
    c.readContract({ address: MEZO.musd, abi: erc20Abi, functionName: "allowance", args: [owner, pilotAddress()] }),
    c.readContract({ address: pilotAddress(), abi: pilotAbi, functionName: "remainingPull", args: [tokenId] }),
  ]);
  const m = [bal as bigint, allowance as bigint, remaining as bigint];
  return m.reduce((a, b) => (b < a ? b : a));
}

export type Action = { kind: "vote" | "harvest" | "compound" | "skip"; tx?: Hex; reason: string };

function keeperWallet() {
  const pk = process.env.KEEPER_PRIVATE_KEY as Hex | undefined;
  if (!pk) throw new Error("KEEPER_PRIVATE_KEY is not set");
  const account = privateKeyToAccount(pk);
  return createWalletClient({ account, chain: mezoTestnet, transport: http(process.env.MEZO_RPC_URL ?? "https://rpc.test.mezo.org") });
}

type PilotFn = "vote" | "harvest" | "compound";

/** Mezo's gas estimates run short on veBTC writes, so pad them, and treat a reverted receipt as a failure. */
async function send(fn: PilotFn, args: readonly unknown[]): Promise<Hex> {
  const c = publicClient();
  const wallet = keeperWallet();
  const call = { address: pilotAddress(), abi: pilotAbi, functionName: fn, args, account: wallet.account } as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const est = await c.estimateContractGas(call as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tx = await wallet.writeContract({ ...(call as any), gas: (est * 18n) / 10n });
  const r = await c.waitForTransactionReceipt({ hash: tx, timeout: 60_000 });
  if (r.status !== "success") throw new Error(`${fn} reverted in ${tx}`);
  return tx;
}

/**
 * One keeper pass for one veBTC: vote if it hasn't this epoch, harvest anything claimable, then
 * compound MUSD the owner made available. Every step is checked again by the contract.
 */
export async function runPilot(tokenId: bigint, market?: MarketSnapshot): Promise<{ actions: Action[]; plan?: Plan }> {
  const actions: Action[] = [];
  const en = await readEnrollment(tokenId);
  if (!en || !en.enrollment.active) return { actions: [{ kind: "skip", reason: "This veBTC is not enrolled." }] };
  if (!en.live) return { actions: [{ kind: "skip", reason: "The pilot is no longer approved on this veBTC, or it changed hands." }] };

  const m = market ?? (await snapshotMarket());
  const nft = await snapshotNft(tokenId, m);
  const policy = toPolicyInput(en.enrollment.policy);
  const musdAvail = await compoundableMusd(tokenId, en.enrollment.owner);
  const plan = await finalize(buildCore(m, nft, policy, Number(musdAvail) / 1e18));
  const now = Math.floor(Date.now() / 1000);

  // 1. vote
  if (nft.votedThisEpoch) {
    actions.push({ kind: "skip", reason: "Already voted this epoch; the next vote opens Thursday 01:00 UTC." });
  } else if (now < m.epoch + 3600 || now > m.voteClosesAt) {
    actions.push({ kind: "skip", reason: "Outside Mezo's voting window (it opens 1 hour after the epoch starts and closes 1 hour before it ends)." });
  } else if (plan.votes.length === 0 || nft.power <= 0) {
    actions.push({ kind: "skip", reason: "No voting power to allocate." });
  } else {
    const pools = plan.votes.map((v) => v.pool);
    const weights = plan.votes.map((v) => BigInt(v.bps));
    const tx = await send("vote", [tokenId, pools, weights, toHex(plan.json)]);
    actions.push({ kind: "vote", tx, reason: plan.narrative.headline });
  }

  // 2. harvest everything claimable (Mezo pays it to the owner)
  if (nft.claimable.length) {
    const group = (kind: "incentive" | "fee") => {
      const by = new Map<Address, Address[]>();
      for (const cl of nft.claimable.filter((x) => x.kind === kind)) {
        const list = by.get(cl.contract) ?? [];
        if (!list.includes(cl.token)) list.push(cl.token);
        by.set(cl.contract, list);
      }
      return [[...by.keys()], [...by.values()]] as const;
    };
    const [bribes, bribeTokens] = group("incentive");
    const [fees, feeTokens] = group("fee");
    try {
      const tx = await send("harvest", [tokenId, bribes, bribeTokens.map((t) => [...t]), fees, feeTokens.map((t) => [...t])]);
      actions.push({ kind: "harvest", tx, reason: `Claimed ${nft.claimable.length} reward balances worth about $${plan.harvest.claimableUsd}.` });
    } catch (e) {
      actions.push({ kind: "skip", reason: `Harvest failed: ${(e as Error).message.slice(0, 140)}` });
    }
  }

  // 3. compound
  const musd = await compoundableMusd(tokenId, en.enrollment.owner);
  if (musd >= 10n ** 18n) {
    const boostBps = Math.min(plan.compound.boostPct * 100, en.enrollment.policy.boostShareBps);
    const finalBps = en.enrollment.policy.autoSave ? boostBps : 10_000;
    if (!en.enrollment.policy.autoSave && en.enrollment.policy.boostShareBps < 10_000) {
      actions.push({ kind: "skip", reason: "Savings are off and the boost share is below 100%, so there is nothing to compound into." });
    } else {
      const tx = await send("compound", [tokenId, musd, finalBps, plan.hash]);
      actions.push({
        kind: "compound",
        tx,
        reason: `Compounded ${(Number(musd) / 1e18).toFixed(2)} MUSD: ${finalBps / 100}% to boost incentives, the rest to the Savings Vault.`,
      });
    }
  } else {
    actions.push({ kind: "skip", reason: "No MUSD made available to compound (balance, allowance or this epoch's cap)." });
  }

  return { actions, plan };
}

export type JournalEntry = {
  tokenId: string;
  epoch: number;
  planHash: Hex;
  tx: Hex;
  blockNumber: string;
  timestamp: number;
  plan: Record<string, unknown>;
};

export async function readJournal(tokenId?: bigint): Promise<JournalEntry[]> {
  if (!PILOT_ADDRESS) return [];
  const c = publicClient();
  const latest = await c.getBlockNumber();
  const from = BigInt(process.env.PILOT_DEPLOY_BLOCK ?? "0");
  const step = 9_500n;
  const logs: Log[] = [];
  for (let start = from > 0n ? from : latest - step * 4n; start <= latest; start += step + 1n) {
    const end = start + step > latest ? latest : start + step;
    const chunk = await c.getLogs({
      address: pilotAddress(),
      event: pilotAbi.find((x) => x.type === "event" && x.name === "PlanPublished") as never,
      args: tokenId !== undefined ? ({ tokenId } as never) : undefined,
      fromBlock: start,
      toBlock: end,
    });
    logs.push(...(chunk as unknown as Log[]));
  }
  const blocks = new Map<bigint, number>();
  const out: JournalEntry[] = [];
  for (const log of logs) {
    const d = decodeEventLog({ abi: pilotAbi, data: log.data, topics: log.topics }) as unknown as {
      args: { tokenId: bigint; epoch: bigint; planHash: Hex; plan: Hex };
    };
    if (!blocks.has(log.blockNumber!)) {
      const b = await c.getBlock({ blockNumber: log.blockNumber! });
      blocks.set(log.blockNumber!, Number(b.timestamp));
    }
    let plan: Record<string, unknown> = {};
    try {
      plan = JSON.parse(hexToString(d.args.plan));
    } catch {
      plan = { raw: d.args.plan };
    }
    out.push({
      tokenId: d.args.tokenId.toString(),
      epoch: Number(d.args.epoch),
      planHash: d.args.planHash,
      tx: log.transactionHash!,
      blockNumber: log.blockNumber!.toString(),
      timestamp: blocks.get(log.blockNumber!)!,
      plan,
    });
  }
  return out.sort((a, b) => b.timestamp - a.timestamp);
}

export async function positionsOf(owner: Address) {
  const c = publicClient();
  const n = Number(await c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "balanceOf", args: [owner] }));
  const ids = (await c.multicall({
    contracts: Array.from({ length: Math.min(n, 50) }, (_, i) => ({
      address: MEZO.veBTC,
      abi: veAbi,
      functionName: "ownerToNFTokenIdList",
      args: [owner, BigInt(i)],
    }) as const),
    allowFailure: false,
  })) as bigint[];
  const rows = await Promise.all(
    ids.map(async (id) => {
      const [power, locked, en] = await Promise.all([
        c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "votingPowerOfNFT", args: [id] }),
        c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "locked", args: [id] }),
        readEnrollment(id).catch(() => null),
      ]);
      const l = locked as unknown as readonly [bigint, bigint, boolean, bigint];
      return {
        tokenId: id.toString(),
        power: Number(power as bigint) / 1e18,
        boost: l[3] ? Number(l[3]) / 1e18 : 1,
        lockedBtc: Number(l[0]) / 1e18,
        lockEnd: Number(l[1]),
        permanent: Boolean(l[2]),
        enrolled: Boolean(en?.enrollment.active),
        live: Boolean(en?.live),
        policy: en
          ? { ...en.enrollment.policy, epochPullCap: (Number(en.enrollment.policy.epochPullCap) / 1e18).toString() }
          : undefined,
      };
    }),
  );
  return rows.filter((r) => r.power > 0 || r.lockedBtc > 0);
}
