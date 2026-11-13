import { NextResponse, type NextRequest } from "next/server";
import { memo } from "@/lib/brain/cache";
import { buildCore, finalize, DEFAULT_POLICY, type PolicyInput } from "@/lib/brain/plan";
import { snapshotMarket, snapshotNft } from "@/lib/brain/snapshot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const raw = q.get("tokenId") ?? "";
  if (!/^\d{1,10}$/.test(raw)) return NextResponse.json({ error: "tokenId must be a veBTC id" }, { status: 400 });
  const tokenId = BigInt(raw);
  const num = (k: string, d: number) => (q.has(k) && Number.isFinite(Number(q.get(k))) ? Number(q.get(k)) : d);
  const policy: PolicyInput = {
    cap: clamp(num("cap", DEFAULT_POLICY.cap), 0.04, 1),
    minPools: Math.round(clamp(num("minPools", DEFAULT_POLICY.minPools), 0, 30)),
    boostShare: clamp(num("boostShare", DEFAULT_POLICY.boostShare), 0, 1),
    autoSave: q.get("autoSave") !== "0",
  };
  const musd = clamp(num("musd", 0), 0, 1e9);
  const key = `plan:${tokenId}:${policy.cap}:${policy.minPools}:${policy.boostShare}:${policy.autoSave}:${musd}`;
  try {
    const market = await memo("market", 60_000, snapshotMarket);
    const nft = await memo(`nft:${tokenId}:${market.block}`, 60_000, () => snapshotNft(tokenId, market));
    const plan = await memo(key + ":" + market.block, 180_000, () => finalize(buildCore(market, nft, policy, musd)));
    return NextResponse.json({
      plan: { ...plan, json: undefined },
      nft,
      market: { epoch: market.epoch, voteClosesAt: market.voteClosesAt, epochEnds: market.epochEnds, totalVotes: market.totalVotes, block: market.block, prices: market.prices },
    });
  } catch (e) {
    const msg = (e as Error).message;
    const status = /nonexistent|ERC721|owner query|reverted/i.test(msg) ? 404 : 502;
    return NextResponse.json({ error: status === 404 ? "No such veBTC on Mezo testnet." : "The brain could not read Mezo right now.", detail: msg.slice(0, 200) }, { status });
  }
}
