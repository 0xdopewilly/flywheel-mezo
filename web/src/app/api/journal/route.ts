import { NextResponse, type NextRequest } from "next/server";
import { memo } from "@/lib/brain/cache";
import { readJournal } from "@/lib/brain/pilot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("tokenId");
  if (raw !== null && !/^\d{1,10}$/.test(raw)) return NextResponse.json({ error: "tokenId must be a veBTC id" }, { status: 400 });
  try {
    const entries = await memo(`journal:${raw ?? "all"}`, 20_000, () => readJournal(raw === null ? undefined : BigInt(raw)));
    return NextResponse.json({ entries });
  } catch (e) {
    return NextResponse.json({ error: "Could not read the journal.", detail: (e as Error).message.slice(0, 200) }, { status: 502 });
  }
}
