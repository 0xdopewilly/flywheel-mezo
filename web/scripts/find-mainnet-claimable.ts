// Dev helper: find mainnet veBTC positions (EOA-owned) with unclaimed pool rewards, for the fork proof.
import { createPublicClient, http, type Address } from "viem";
import { rewardAbi, veAbi, voterAbi } from "../src/lib/mezo/abis";

const c = createPublicClient({ transport: http("https://mezo.drpc.org", { batch: { batchSize: 100 } }) , chain: { id: 31612, name: "mezo", nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 }, rpcUrls: { default: { http: ["https://mezo.drpc.org"] } }, contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } } } });
const VE = "0x3D4b1b884A7a1E59fE8589a3296EC8f8cBB6f279" as Address;
const V = "0x48233cCC97B87Ba93bCA212cbEe48e3210211f03" as Address;
const MUSD = "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186" as Address;
const BTC = "0x7b7C000000000000000000000000000000000000" as Address;
const MEZO = "0x7B7c000000000000000000000000000000000001" as Address;

async function main() {
  const n = Number(await c.readContract({ address: V, abi: voterAbi, functionName: "length" }));
  const pools = (await c.multicall({ contracts: Array.from({ length: n }, (_, i) => ({ address: V, abi: voterAbi, functionName: "pools", args: [BigInt(i)] }) as const), allowFailure: false })) as Address[];
  const weights = (await c.multicall({ contracts: pools.map((p) => ({ address: V, abi: voterAbi, functionName: "weights", args: [p] }) as const), allowFailure: false })) as bigint[];
  const top = pools.map((p, i) => ({ p, w: weights[i] })).sort((a, b) => (b.w > a.w ? 1 : -1)).slice(0, 4);
  const gauges = (await c.multicall({ contracts: top.map((t) => ({ address: V, abi: voterAbi, functionName: "gauges", args: [t.p] }) as const), allowFailure: false })) as Address[];
  const rewards = (await c.multicall({ contracts: gauges.flatMap((g) => [{ address: V, abi: voterAbi, functionName: "gaugeToBribe", args: [g] } as const, { address: V, abi: voterAbi, functionName: "gaugeToFees", args: [g] } as const]), allowFailure: false })) as Address[];
  console.log("top pools", top.map((t) => `${t.p} w=${Number(t.w) / 1e18}`));
  const next = Number(await c.readContract({ address: VE, abi: veAbi, functionName: "tokenId" }));
  for (let start = Number(process.argv[2] ?? next - 1); start > Number(process.argv[2] ?? next - 1) - 1200; start -= 60) {
    const ids = Array.from({ length: 60 }, (_, k) => BigInt(start - k)).filter((x) => x > 0n);
    const owners = await c.multicall({ contracts: ids.map((id) => ({ address: VE, abi: veAbi, functionName: "ownerOf", args: [id] }) as const), allowFailure: true });
    const calls = ids.flatMap((id) => rewards.flatMap((r) => [MUSD, BTC, MEZO].map((t) => ({ id, r, t }))));
    const earned = await c.multicall({ contracts: calls.map(({ id, r, t }) => ({ address: r, abi: rewardAbi, functionName: "earned", args: [t, id] }) as const), allowFailure: true });
    const hits = new Map<bigint, number>();
    calls.forEach(({ id }, k) => { const v = earned[k].result as bigint | undefined; if (v && v > 0n) hits.set(id, (hits.get(id) ?? 0) + 1); });
    for (const [id, cnt] of hits) {
      const o = owners[ids.indexOf(id)].result as Address | undefined;
      if (!o) continue;
      const code = await c.getCode({ address: o });
      if (code && code !== "0x") continue;
      console.log("CANDIDATE", id.toString(), "owner", o, "reward balances", cnt);
    }
    if (hits.size) break;
  }
}
main();
