import "server-only";
import { createWalletClient, http, parseAbi, parseEther, parseEventLogs, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { MEZO, mezoTestnet, publicClient } from "@/lib/mezo/chain";
import { erc20Abi, veAbi } from "@/lib/mezo/abis";

/**
 * Test veBTC for anyone trying Flywheel on Mezo testnet (judges included): a small veBTC locked straight
 * into their wallet with veBTC.createLockFor, a pinch of BTC for gas, and some MUSD to reinvest.
 * Testnet only; one per wallet that holds no veBTC.
 */
export const FAUCET = {
  lockBtc: parseEther("0.0008"),
  lockSeconds: 28n * 24n * 3600n,
  gasBtc: parseEther("0.0002"),
  musd: parseEther("15"),
} as const;

const transferAbi = parseAbi(["function transfer(address to, uint256 amount) returns (bool)"]);

const lockAbi = parseAbi([
  "function createLockFor(uint256 _value, uint256 _lockDuration, address _to) returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

export type FaucetResult = { tokenId: string; lockTx: Hex; gasTx?: Hex; musdTx?: Hex; musd: string };

// one claim at a time per instance, so the faucet's nonces never collide
let queue: Promise<unknown> = Promise.resolve();
const claimed = new Set<string>();

export function faucetConfigured() {
  return !!process.env.FAUCET_PRIVATE_KEY;
}

export async function faucetStock() {
  const pk = process.env.FAUCET_PRIVATE_KEY as Hex | undefined;
  if (!pk) return null;
  const who = privateKeyToAccount(pk).address;
  const c = publicClient();
  const [btc, musd] = await Promise.all([
    c.getBalance({ address: who }),
    c.readContract({ address: MEZO.musd, abi: erc20Abi, functionName: "balanceOf", args: [who] }) as Promise<bigint>,
  ]);
  const perClaim = FAUCET.lockBtc + FAUCET.gasBtc + parseEther("0.00005");
  return { address: who, btc, musd, claimsLeft: Number(btc / perClaim) };
}

export function claimTestVeBTC(to: Address): Promise<FaucetResult> {
  const run = queue.then(() => claim(to));
  queue = run.catch(() => undefined);
  return run;
}

async function claim(to: Address): Promise<FaucetResult> {
  const pk = process.env.FAUCET_PRIVATE_KEY as Hex | undefined;
  if (!pk) throw new FaucetError("The test faucet is not set up on this deployment.", 503);
  const key = to.toLowerCase();
  if (claimed.has(key)) throw new FaucetError("This wallet already got a test veBTC.", 409);

  const c = publicClient();
  const held = (await c.readContract({ address: MEZO.veBTC, abi: veAbi, functionName: "balanceOf", args: [to] })) as bigint;
  if (held > 0n) throw new FaucetError("This wallet already holds veBTC on Mezo testnet, so use that one.", 409);

  const stock = await faucetStock();
  if (!stock || stock.claimsLeft < 1) throw new FaucetError("The test faucet is empty for now. Lock test BTC at testnet.mezo.org instead.", 503);

  const account = privateKeyToAccount(pk);
  const wallet = createWalletClient({ account, chain: mezoTestnet, transport: http(process.env.MEZO_RPC_URL ?? "https://rpc.test.mezo.org") });
  claimed.add(key);
  try {
    // 1. the veBTC itself, minted straight to the visitor
    const lockCall = { address: MEZO.veBTC, abi: lockAbi, functionName: "createLockFor", args: [FAUCET.lockBtc, FAUCET.lockSeconds, to], account } as const;
    const est = await c.estimateContractGas(lockCall);
    const lockTx = await wallet.writeContract({ ...lockCall, gas: (est * 18n) / 10n });
    const r = await c.waitForTransactionReceipt({ hash: lockTx, timeout: 60_000 });
    if (r.status !== "success") throw new FaucetError("Mezo rejected the lock. Try again in a minute.", 502);
    const minted = parseEventLogs({ abi: lockAbi, eventName: "Transfer", logs: r.logs }).find(
      (l) => l.address.toLowerCase() === MEZO.veBTC.toLowerCase() && l.args.to.toLowerCase() === key,
    );
    if (!minted) throw new FaucetError("The lock went through but the new veBTC id was not found.", 502);

    // 2. gas, only if the wallet has almost none
    let gasTx: Hex | undefined;
    if ((await c.getBalance({ address: to })) < FAUCET.gasBtc / 2n) {
      gasTx = await wallet.sendTransaction({ to, value: FAUCET.gasBtc, gas: 60_000n });
      await c.waitForTransactionReceipt({ hash: gasTx, timeout: 60_000 });
    }

    // 3. MUSD to reinvest, while it lasts
    let musdTx: Hex | undefined;
    let musd = 0n;
    if (stock.musd >= FAUCET.musd) {
      musdTx = await wallet.writeContract({ address: MEZO.musd, abi: transferAbi, functionName: "transfer", args: [to, FAUCET.musd], account, gas: 200_000n });
      await c.waitForTransactionReceipt({ hash: musdTx, timeout: 60_000 });
      musd = FAUCET.musd;
    }
    return { tokenId: minted.args.tokenId.toString(), lockTx, gasTx, musdTx, musd: (Number(musd) / 1e18).toString() };
  } catch (e) {
    claimed.delete(key);
    throw e;
  }
}

export class FaucetError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
