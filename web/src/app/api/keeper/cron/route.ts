import { NextResponse, type NextRequest } from "next/server";
import { publicClient } from "@/lib/mezo/chain";
import { pilotAbi } from "@/lib/mezo/pilotAbi";
import { pilotAddress, runPilot } from "@/lib/brain/pilot";
import { snapshotMarket } from "@/lib/brain/snapshot";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Scheduled keeper pass over every enrolled veBTC (Vercel Cron sends the CRON_SECRET bearer). */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ids = (await publicClient().readContract({ address: pilotAddress(), abi: pilotAbi, functionName: "enrolledIds" })) as bigint[];
  const market = await snapshotMarket();
  const results: { tokenId: string; actions?: unknown; error?: string }[] = [];
  for (const id of ids) {
    try {
      const { actions } = await runPilot(id, market, "cron");
      results.push({ tokenId: id.toString(), actions });
    } catch (e) {
      results.push({ tokenId: id.toString(), error: (e as Error).message.slice(0, 200) });
    }
  }
  return NextResponse.json({ ran: results.length, results });
}
