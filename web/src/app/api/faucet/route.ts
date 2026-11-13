import { NextResponse, type NextRequest } from "next/server";
import { getAddress, isAddress } from "viem";
import { FaucetError, claimTestVeBTC, faucetStock } from "@/lib/brain/faucet";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const byIp = new Map<string, number[]>();

/** How much is left, so the app can hide the button when the faucet is dry. */
export async function GET() {
  try {
    const s = await faucetStock();
    return NextResponse.json(s ? { available: s.claimsLeft > 0, claimsLeft: s.claimsLeft } : { available: false, claimsLeft: 0 });
  } catch {
    return NextResponse.json({ available: false, claimsLeft: 0 });
  }
}

export async function POST(req: NextRequest) {
  let address = "";
  try {
    address = String(((await req.json()) as { address?: unknown }).address ?? "");
  } catch {
    return NextResponse.json({ error: "Send JSON: { address }" }, { status: 400 });
  }
  if (!isAddress(address)) return NextResponse.json({ error: "That is not a wallet address." }, { status: 400 });

  // best effort: three claims per IP per day on this instance
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (byIp.get(ip) ?? []).filter((t) => now - t < 86_400_000);
  if (recent.length >= 3) return NextResponse.json({ error: "This network already claimed three test veBTC today." }, { status: 429 });
  byIp.set(ip, [...recent, now]);

  try {
    const out = await claimTestVeBTC(getAddress(address));
    return NextResponse.json(out);
  } catch (e) {
    byIp.set(ip, recent);
    const status = e instanceof FaucetError ? e.status : 502;
    const msg = e instanceof FaucetError ? e.message : "The faucet could not finish. Try again in a minute.";
    return NextResponse.json({ error: msg, detail: e instanceof FaucetError ? undefined : (e as Error).message.slice(0, 200) }, { status });
  }
}
