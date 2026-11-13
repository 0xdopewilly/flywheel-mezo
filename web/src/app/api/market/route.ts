import { NextResponse } from "next/server";
import { memo } from "@/lib/brain/cache";
import { sharedMarket } from "@/lib/brain/shared";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const market = await memo("market", 30_000, sharedMarket);
    return NextResponse.json(market, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (e) {
    return NextResponse.json({ error: "Could not read Mezo Earn right now.", detail: (e as Error).message.slice(0, 200) }, { status: 502 });
  }
}
