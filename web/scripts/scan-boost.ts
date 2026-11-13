// Dev helper: scan every BoostVoter gauge for incentives this epoch and last.
import type { Address } from "viem";
import { MEZO, WEEK, epochStart, publicClient } from "../src/lib/mezo/chain";
import { boostVoterAbi, rewardAbi } from "../src/lib/mezo/abis";

async function main() {
  const c = publicClient();
  const n = Number(await c.readContract({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "length" }));
  const gs = (await c.multicall({ contracts: Array.from({ length: n }, (_, i) => ({ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "gauges", args: [BigInt(i)] }) as const), allowFailure: false })) as Address[];
  const wb = await c.multicall({ contracts: gs.flatMap((g) => [{ address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "weights", args: [g] } as const, { address: MEZO.boostVoter, abi: boostVoterAbi, functionName: "gaugeToBribe", args: [g] } as const]), allowFailure: true });
  const bribes = gs.map((_, k) => wb[k * 2 + 1].result as Address);
  const lens = await c.multicall({ contracts: bribes.map((b) => ({ address: b, abi: rewardAbi, functionName: "rewardsListLength" }) as const), allowFailure: true });
  const withTokens = bribes.map((b, k) => ({ b, k, len: Number(lens[k].result ?? 0n), w: Number((wb[k * 2].result as bigint) ?? 0n) / 1e18 })).filter((x) => x.len > 0);
  console.log("gauges", n, "with reward tokens", withTokens.length, "with veMEZO votes", gs.filter((_, k) => ((wb[k * 2].result as bigint) ?? 0n) > 0n).length);
  const e = epochStart(Math.floor(Date.now() / 1000));
  for (const x of withTokens.slice(0, 40)) {
    const toks = (await c.multicall({ contracts: Array.from({ length: x.len }, (_, j) => ({ address: x.b, abi: rewardAbi, functionName: "rewards", args: [BigInt(j)] }) as const), allowFailure: false })) as Address[];
    const amts = await c.multicall({ contracts: toks.flatMap((t) => [e, e - WEEK, e - 2 * WEEK].map((ep) => ({ address: x.b, abi: rewardAbi, functionName: "tokenRewardsPerEpoch", args: [t, BigInt(ep)] }) as const)), allowFailure: true });
    console.log(`#${x.k} votes=${x.w.toFixed(1)} ` + toks.map((t, j) => `${t.slice(0, 8)} cur=${Number(amts[j * 3].result ?? 0n) / 1e18} prev=${Number(amts[j * 3 + 1].result ?? 0n) / 1e18} prev2=${Number(amts[j * 3 + 2].result ?? 0n) / 1e18}`).join(" | "));
  }
}
main();
