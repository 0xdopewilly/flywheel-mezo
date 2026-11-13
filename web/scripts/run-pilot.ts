// Dev helper: one keeper pass for a veBTC, then print the on-chain journal.
// MEZO_RPC_URL=... NEXT_PUBLIC_PILOT_ADDRESS=... KEEPER_PRIVATE_KEY=... npx tsx --tsconfig tsconfig.json scripts/run-pilot.ts <tokenId>
import { readJournal, runPilot } from "../src/lib/brain/pilot";

async function main() {
  const id = BigInt(process.argv[2] ?? "1742");
  const t0 = Date.now();
  const { actions, plan } = await runPilot(id);
  console.log("ms", Date.now() - t0);
  console.log(JSON.stringify(actions, null, 1));
  if (plan) console.log("plan hash", plan.hash, "bytes", plan.json.length, "\nheadline:", plan.narrative.headline, "\nwhy:", plan.narrative.why);
  const j = await readJournal(id);
  console.log("journal entries", j.length, j[0] ? { tx: j[0].tx, hash: j[0].planHash, headline: (j[0].plan as { headline?: string }).headline } : "");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
