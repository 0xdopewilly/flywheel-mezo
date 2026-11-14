# AKINDO submission form: Flywheel (Mezo WaveHack Wave 2)

Copy each answer into the matching field.

**Project name**
Flywheel

**Project category (3–5 words)**
veBTC yield autopilot

**TL;DR**
Flywheel is a non-custodial autopilot for Mezo veBTC. Every epoch it votes your veBTC across Mezo Earn gauges, harvests what you earned, and compounds MUSD into boost incentives or the MUSD Savings Vault. It stays inside limits you set onchain and publishes its reasoning onchain with every vote.

**How it works**
Problem: a veBTC only earns if someone votes it every week. Each Thursday someone has to split it across the live gauges (17 on testnet, 28 on mainnet), weighing incentives against crowding. Then they claim incentives and fees, buy boost from veMEZO voters and reinvest the MUSD. Most holders vote once and forget, or pile into the most crowded gauge, where each vote earns least.

Solution: the owner approves our FlywheelPilot contract on their veBTC (the NFT never leaves their wallet) and enrolls with a policy:
- the most of their votes in any one pool;
- a minimum number of pools;
- pools to avoid;
- a weekly MUSD reinvest budget;
- the share of a compound that may buy boost;
- auto-save on or off.

Each epoch the brain snapshots every gauge and works out the split that earns most per vote once crowding is counted (water-filling, benchmarked against copying the crowd, going all-in and an even split). It prices boost with Mezo's boost formula, and Claude explains the plan in plain English, with a guard that rejects any number not in the plan.

The keeper then:
1. votes through Mezo's PoolsVoter. The contract checks every split against the owner's policy and publishes the full plan in a PlanPublished event in the same transaction.
2. harvests incentives and fees, which Mezo pays straight to the owner.
3. compounds the owner's MUSD:
   - 5% fee to the treasury;
   - part as incentives on the veBTC's own boost gauge (BoostVoter.createBoostGauge + addBribes) to attract veMEZO votes;
   - the rest into the MUSD Savings Vault, with the sMUSD sent to the owner.

How we use MUSD/MEZO:
- MUSD is the compounding currency: boost incentives, Savings Vault deposits, and the fee.
- The veMEZO boost market is priced into every decision, and Flywheel bids into it on the owner's behalf.
- The integration covers veBTC, PoolsVoter, BoostVoter and the boost gauge factory, MUSD, the MUSD Savings Vault and veMEZO, plus Mezo Passport for wallet connection.

What's shown (testnet, not users): FlywheelPilot is deployed and verified on Mezo testnet at 0x22cfe1B060Aa7E10Ae6D114346Cc4f6B8550aab3. Two veBTC of our own (#1752, #1753), owned by a wallet separate from the keeper, have been voted with plans published onchain and compounded 160 MUSD in total:
- 120.65 sMUSD to the owner;
- 31.35 MUSD as boost incentives on two new boost gauges;
- 8 MUSD in fees.

A mainnet fork test shows Flywheel harvesting exactly the 21.0099 MUSD Mezo owed a real mainnet veBTC (#5803) to its owner, and the owner's cap rejecting an all-in vote on the live mainnet voter. The contract keeps nothing.

Built for newcomers:
- **Mission panel:** walks you from "no wallet" to "autopilot armed" in five live-checked steps, explaining what you sign and what can't happen at each one.
- **Limit presets:** Safe, Balanced and Bold help you start.
- **Fast-forward:** replays twelve weeks of the loop in a minute from your veBTC's live plan, labelled as a projection, because Mezo epochs can't be sped up.
- **/guide page:** the weekly loop, a glossary, safety Q&A and troubleshooting.
- **Dark and light themes.**

How to test: open https://flywheel-mezo.vercel.app/app, connect any wallet and click "Get a test veBTC". Our testnet faucet mints a small veBTC to your wallet, with gas and 15 MUSD. Then approve, enroll and click "Run the brain now" to see your own vote, plan and compound onchain.

**Target group**
- **Who:** veBTC holders on Mezo, at any experience level. That includes small lockers who never vote, and larger holders who vote but leave boost and idle MUSD on the table.
- **Why Track 1:** it turns veBTC and the MUSD it earns into productive, auto-compounding capital, plugged into Mezo's vote-escrow and boost systems.
- **Device:** desktop and mobile web, global.

**Tech stack**
- **Contracts:** Solidity 0.8.24, Foundry (unit, fuzz, and Mezo testnet + mainnet fork tests), OpenZeppelin.
- **App:** Next.js 14, React 18, Tailwind v4, framer-motion, viem, wagmi, RainbowKit, Mezo Passport.
- **Brain:** a TypeScript optimizer and boost pricing, plus Claude (claude-sonnet-5-5 via NEAR AI) for the narration.
- **Hosting:** Vercel (app, API routes, daily keeper cron).

**Track**
Track 1: DeFi (Borrowing, Lending, Looping, and Yield)

**Chain deployed on**
Mezo (testnet, chain 31611)

**Project status**
Entirely new, built during Wave 2.

**Project readiness**
Testnet deployment. Contract verified; live app at https://flywheel-mezo.vercel.app. Plus mainnet fork tests.

**Future milestones**
1. **Mainnet beta (Dec 2026 – Jan 2027):**
   - audit FlywheelPilot and deploy on Mezo mainnet with a deposit cap;
   - add a second keeper for redundancy;
   - add Telegram alerts whenever a plan is published.
2. **Boost market maker (Q1 2027):**
   - pool boost bids across every Flywheel veBTC;
   - launch the other side, a veMEZO autopilot that votes for the best boost incentives, so Flywheel sits on both sides of Mezo's boost market.
3. **Managed veBTC for small holders (Q2 2027):** use Mezo managed locks so holders too small to justify gas can join a shared, Flywheel-piloted position.

**Team**
0xdopewilly, solo builder (contracts, brain, keeper, frontend). X: @sentinel_dapper · Discord: @dopewilly · GitHub: github.com/0xdopewilly

**Links**
- Live app: https://flywheel-mezo.vercel.app
- GitHub: https://github.com/0xdopewilly/flywheel-mezo
- Deck: https://flywheel-mezo.vercel.app/deck (PDF: https://flywheel-mezo.vercel.app/Flywheel-deck.pdf, also docs/Flywheel-deck.pdf in the repo)
- Contract: https://explorer.test.mezo.org/address/0x22cfe1B060Aa7E10Ae6D114346Cc4f6B8550aab3
- Pitch video: https://youtu.be/35K6mhQ9tpU
