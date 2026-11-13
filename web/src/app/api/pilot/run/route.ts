import { NextResponse, type NextRequest } from "next/server";
import { invalidate } from "@/lib/brain/cache";
import { runPilot } from "@/lib/brain/pilot";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Anyone may ask the brain to act for an enrolled veBTC: every action is re-checked on-chain
// against the owner's policy, rewards only ever go to the owner, and a veBTC votes once per epoch.
const lastRun = new Map<string, number>();

export async function POST(req: NextRequest) {
  let tokenId: string;
  try {
    tokenId = String(((await req.json()) as { tokenId?: unknown }).tokenId ?? "");
  } catch {
    return NextResponse.json({ error: "Send JSON: { tokenId }" }, { status: 400 });
  }
  if (!/^\d{1,10}$/.test(tokenId)) return NextResponse.json({ error: "tokenId must be a veBTC id" }, { status: 400 });
  const prev = lastRun.get(tokenId) ?? 0;
  if (Date.now() - prev < 20_000) return NextResponse.json({ error: "The brain just ran for this veBTC; give it a few seconds." }, { status: 429 });
  lastRun.set(tokenId, Date.now());
  try {
    const { actions, plan } = await runPilot(BigInt(tokenId));
    invalidate(`nft:${tokenId}`);
    invalidate("market");
    return NextResponse.json({ actions, plan: plan ? { ...plan, json: undefined } : undefined });
  } catch (e) {
    return NextResponse.json({ error: "The brain could not finish this run.", detail: (e as Error).message.slice(0, 300) }, { status: 502 });
  }
}
