import { NextResponse, type NextRequest } from "next/server";
import { isAddress } from "viem";
import { positionsOf } from "@/lib/brain/pilot";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner") ?? "";
  if (!isAddress(owner)) return NextResponse.json({ error: "owner must be an address" }, { status: 400 });
  try {
    return NextResponse.json({ positions: await positionsOf(owner) });
  } catch (e) {
    return NextResponse.json({ error: "Could not read veBTC positions.", detail: (e as Error).message.slice(0, 200) }, { status: 502 });
  }
}
