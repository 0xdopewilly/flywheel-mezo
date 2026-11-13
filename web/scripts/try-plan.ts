// Dev helper: run the brain end to end against Mezo testnet for one veBTC.
// npx tsx --tsconfig tsconfig.json scripts/try-plan.ts <tokenId>
import { planFor } from "../src/lib/brain/plan";

const id = BigInt(process.argv[2] ?? "1742");
const t0 = Date.now();
planFor(id)
  .then(({ market, nft, plan }) => {
    console.log("ms", Date.now() - t0, "gauges", market.gauges.length, "totalVotes", market.totalVotes.toFixed(3), "prices", market.prices);
    console.log("boost market", market.boost);
    for (const g of market.gauges) {
      console.log(
        `${g.label.padEnd(22)} votes=${g.votes.toFixed(3)} reward=$${g.rewardUsd.toFixed(2)} (inc $${g.incentivesUsd.toFixed(2)} fees $${g.feesUsdProjected.toFixed(2)})`,
      );
    }
    console.log("nft", { power: nft.power, unboosted: nft.unboosted, boost: nft.boost, voted: nft.votedThisEpoch, claimable: nft.claimable.length });
    console.log(JSON.stringify({ votes: plan.votes, expected: plan.expectedUsd, baselines: plan.baselines, boost: plan.boost }, null, 1));
    console.log("NARRATIVE", plan.narrative, "json bytes", plan.json.length);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
