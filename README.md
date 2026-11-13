# Flywheel

**Your veBTC, on autopilot.** Flywheel is a non-custodial autopilot for Mezo veBTC. Every epoch it votes your veBTC across Mezo Earn gauges, claims what you earned, and puts your MUSD back to work as boost incentives or in the MUSD Savings Vault. It only acts inside limits you set onchain, and it publishes its reasoning onchain with every vote.

- **Live app:** https://flywheel-mezo.vercel.app. Open `/app` with no wallet to watch it plan for a real veBTC it pilots on testnet.
- **Contract (Mezo testnet, verified):** [`FlywheelPilot` 0x22cf…aab3](https://explorer.test.mezo.org/address/0x22cfe1B060Aa7E10Ae6D114346Cc4f6B8550aab3)
- **Pitch deck:** [docs/Flywheel-deck.pdf](docs/Flywheel-deck.pdf) · https://flywheel-mezo.vercel.app/deck
- **Video script:** [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md)
- **Track:** Mezo WaveHack Wave 2 · built on Mezo testnet (chain 31611), with fork tests against Mezo mainnet (chain 31612)

---

## Try it yourself (about 2 minutes, Mezo testnet)

You don't need test BTC or an existing veBTC.

1. Open https://flywheel-mezo.vercel.app/app and connect any EVM wallet (Mezo Passport, MetaMask, Rabby…). The app switches it to Mezo testnet.
2. No veBTC yet? Click **Get a test veBTC**. Flywheel's testnet faucet locks 0.0008 test BTC into a veBTC minted straight to your wallet (`veBTC.createLockFor`), and adds a little BTC for gas plus 15 MUSD.
3. Set your limits, then **Let Flywheel vote this veBTC** (approve), **Save your limits on-chain** (enroll) and **Allow the reinvest budget** (MUSD allowance).
4. Click **Run the brain now**. It votes inside your limits and publishes its plan onchain, then compounds your MUSD into boost incentives and the Savings Vault (the sMUSD lands in your wallet). The journal at the bottom of the page reads the plan back from the chain.
5. **Exit autopilot** whenever you like, or revoke the approval in your wallet.

Mezo allows one vote per veBTC per epoch, so a second run in the same week skips the vote and only harvests and compounds.

## The problem

A veBTC only earns if someone votes it every week. Each Thursday at 00:00 UTC Mezo opens a new epoch. Someone has to vote the veBTC across the live gauges (17 on testnet, 28 on mainnet), weighing each gauge's incentives against how much veBTC is already voting there. Then they claim incentives and fees from every gauge they voted, and decide whether to buy boost from veMEZO voters. Finally they put the MUSD to work. Most holders vote once and forget, or pile into the most crowded gauge, where each vote earns least.

## What Flywheel does

```
        ┌──────────── every epoch, inside your onchain limits ────────────┐
        │                                                                 │
   1. VOTE  ──►  2. HARVEST  ──►  3. COMPOUND ──► boost gauge (veMEZO incentives)
   PoolsVoter     claimBribes /        │        └► MUSD Savings Vault (sMUSD to you)
   + plan onchain  claimFees → you      └── 5% of compounded MUSD → treasury (pays the keeper)
```

1. **Vote.** The brain reads every live gauge and works out the split that earns most per vote once crowding is counted. The contract checks that split against your policy before passing it to Mezo's `PoolsVoter`. The full plan (numbers plus plain-English reasoning) is emitted in `PlanPublished` in the same transaction.
2. **Harvest.** It claims incentives and fees through `PoolsVoter.claimBribes` / `claimFees`. Mezo pays them to the veBTC owner directly, so Flywheel never holds rewards.
3. **Compound.** It pulls MUSD you made available, capped per epoch by you. Part goes to incentives on your veBTC's own boost gauge (`BoostVoter.createBoostGauge` + `addBribes`) to attract veMEZO votes and raise your boost. The rest goes to the MUSD Savings Vault, and the sMUSD is sent to you.

### Non-custodial by construction

Your veBTC never leaves your wallet. You `approve` the contract on the NFT and `enroll` with a policy. The contract enforces that policy on every keeper call:

| Your limit | Enforced in `FlywheelPilot` |
|---|---|
| Most of your votes in any one pool (`maxPoolShareBps`) | `vote` reverts `PoolShareTooHigh` |
| Spread across at least N pools (`minPools`) | `vote` reverts `TooFewPools` |
| Pools you never want (`setPoolBlocked`) | `vote` reverts `PoolNotAllowed`; also rejects dead gauges |
| Weekly MUSD reinvest budget (`epochPullCap`) | `compound` reverts `OverEpochCap` |
| Share of a compound that may go to boost (`boostShareBps`) | `compound` reverts `BoostShareTooHigh` |
| Auto-save on/off | `compound` reverts `SavingDisabled` |
| Sold or moved the NFT | every action reverts `OwnerChanged` |
| Want out | `exit()` any time, or revoke the NFT approval |

Fees are hard-capped at 10% in code (`MAX_FEE_BPS`) and set to 5%. They're taken only on MUSD that's compounded, never on votes or harvests. Boost incentives only ever go to the owner's own boost gauge, and savings receipts only ever go to the owner.

## Proof it works

### On Mezo testnet (live now)

The pilot is deployed and verified. To prove the mechanics end to end, we locked test BTC into two veBTC of our own (#1752 and #1753) and enrolled them from an owner wallet that is separate from the keeper wallet. These are demo positions, not outside users: Flywheel has no outside users yet.

| What | Transaction |
|---|---|
| Deploy `FlywheelPilot` (block 16,761,814) | [0xbc8d…19da](https://explorer.test.mezo.org/tx/0xbc8d0419e5c000a09f9774f7cb4f94893a13fd7a6ed7dcc945bde3431e6519da) |
| veBTC #1752: vote 60% MUSD Savings Vault / 40% MUSD-BTC, plan published onchain | [0x36e5…08dd20](https://explorer.test.mezo.org/tx/0x36e5ae6efd02e43972df4309ff64a0ff6bcd17a5a23765deea5920c5c308dd20) |
| veBTC #1752: compound 100 MUSD → 5 fee, 22.8 boost incentives (new boost gauge `0x1d50…af58`), 72.2 into savings | [0x4fed…72c6](https://explorer.test.mezo.org/tx/0x4fedc1b2588c783ca7db5eb5ae8b18afe2bbab0cc6264586b8f2d3c3d06372c6) |
| veBTC #1753: vote under a 50% cap and 3-pool minimum, plan published | [0x7dc8…3c9e](https://explorer.test.mezo.org/tx/0x7dc831985ed0996a051f0d38dbea84b8bf9072e371723b77dfc85e0886a43c9e) |
| veBTC #1753: compound 60 MUSD → 3 fee, 8.55 boost incentives (gauge `0x52d0…6419`), 48.45 into savings | [0x3bbb…8c88](https://explorer.test.mezo.org/tx/0x3bbbd36fe901b17b4fc9cfb4576d17c33070ed080b1d583cede796af46800c88) |

The owner wallet now holds 120.65 sMUSD. On that epoch's live data, #1752's plan expected $15.97 against $7.62 for copying the crowd's split (+110%). The plan, its numbers and that comparison are all inside the onchain plan JSON. The app's journal reads them back from `PlanPublished` logs, not from a database.

### Against Mezo mainnet (fork tests)

`contracts/test/fork/MezoMainnetFork.t.sol` forks Mezo mainnet at block 13,202,859, one block before a real holder claimed by hand:

- **Harvest pays the real owner:** Flywheel claims the **21.0099 MUSD** Mezo owed veBTC #5803 from the sMUSD gauge's fee reward. The exact amount lands in the owner's wallet and the contract keeps nothing.
- **Caps hold on the live voter:** a 70/30 vote goes through the mainnet `PoolsVoter`. The holder's real all-in vote is rejected under a 70% cap.

`MezoTestnetFork.t.sol` runs the vote, the cap and the compound (creating a real boost gauge and depositing to sMUSD) against the testnet contracts.

```
cd contracts
forge test                         # 22 unit + fuzz tests (mocks)
FOUNDRY_PROFILE=fork forge test    # 3 testnet-fork + 2 mainnet-fork tests
cd ../web && npx vitest run        # optimizer tests
```

## The brain

`web/src/lib/brain/`, all server-side:

1. **Snapshot** (`snapshot.ts`): one multicall reads every gauge (incentives, fees, total votes, alive), the veBTC's power and boost, the boost market, and what's claimable through `earned()`. Prices come from CoinGecko, with a fallback.
2. **Optimize** (`optimize.ts`): your share of gauge *i* is `v/(V_i+v)`, which has diminishing returns. The brain maximises Σ R_i·v_i/(V_i+v_i) under your per-pool cap and minimum pool count, using water-filling on the KKT conditions. It also computes three baselines: all-in on the top gauge, copying the crowd's split, and an even split. That gives every plan an honest benchmark.
3. **Boost** (`boost.ts`): uses Mezo's boost formula, `min(5, 1 + 4·(veBTC_total/nft_unboosted)·(veMEZO_on_gauge/veMEZO_total))`, to price the veMEZO needed for a target boost. It bids only when the boost is worth more than it costs. When the boost market is empty, it bids half the value.
4. **Narrate** (`narrate.ts`): `claude-sonnet-5-5` (via NEAR AI's OpenAI-compatible endpoint) explains the plan in plain English. A grounding guard rejects any narrative that quotes a number not in the plan, and falls back to a deterministic template.
5. **Act** (`pilot.ts`): the keeper votes, harvests and compounds, then publishes the plan JSON and its keccak hash onchain. A Vercel cron runs a pass over every enrolled veBTC daily, and anyone can trigger a pass for an enrolled veBTC from the app.

## Mezo integration

| Mezo piece | How Flywheel uses it |
|---|---|
| **veBTC** `0x38E3…130a` | Owner approves the pilot; `ownerOf`/`isApprovedOrOwner` gate every action; `votingPowerOfNFT`, `unboostedVotingPowerOfNFT`, `locked` feed the brain |
| **PoolsVoter** `0x263F…5F0D` | `vote` with the plan's split, `gauges`/`isAlive` checks, `claimBribes`/`claimFees` harvest, `lastVoted` for the epoch window |
| **BoostVoter** `0x21d7…Fd1` + gauge factory `0x2c01…8aD5` | `createBoostGauge` for the veBTC, `addBribes` with MUSD to attract veMEZO votes, `getBoost` read back |
| **MUSD** `0x1189…c503` | The compounding currency; owner sets an allowance and a weekly cap |
| **MUSD Savings Vault (sMUSD)** `0x6f46…7A8e16` | Auto-save destination (sMUSD forwarded to the owner) and a votable gauge the brain often favours |
| **veMEZO** `0xaCE8…111b` | Total voting power and per-gauge votes priced into the boost decision |
| **Mezo Passport** `@mezo-org/passport` | Wallet connection in the app |

## Business model

5% of the MUSD Flywheel compounds goes to the treasury, hard-capped at 10% in code. That pays for the keeper (gas, the LLM call, monitoring) and is only earned when the user's money actually goes back to work. Voting and harvesting are free, so a holder who only wants their votes cast every week pays nothing.

**Who it's for:** veBTC holders who don't want to vote by hand every Thursday, from small lockers who never vote at all to larger holders who vote but leave boost and idle MUSD on the table. **How we reach them:** Mezo Earn's community and Discord, Mezo's ecosystem partners, and the onchain journal: every piloted veBTC builds a public, verifiable track record that holders can point others to.

## Run it

```
# contracts
cd contracts && forge build && forge test
# app (needs MEZO_RPC_URL; NEARAI_API_KEY for narration; NEXT_PUBLIC_PILOT_ADDRESS + KEEPER_PRIVATE_KEY for the keeper)
cd web && pnpm install && pnpm dev
# one keeper pass from the CLI
NODE_OPTIONS=--conditions=react-server npx tsx --tsconfig tsconfig.json scripts/run-pilot.ts 1752
```

| Path | What |
|---|---|
| `contracts/src/FlywheelPilot.sol` | The pilot: enrollment, policy, keeper-only vote/compound, owner-or-keeper harvest |
| `contracts/test/` | Unit + fuzz tests, testnet and mainnet fork tests |
| `contracts/deployments/31611.json` | Testnet deployment record |
| `web/src/lib/brain/` | Snapshot, optimizer, boost pricing, narration, keeper |
| `web/src/app/api/` | `market`, `plan`, `positions`, `journal`, `pilot/run`, `keeper/cron` |
| `web/src/app/` | Landing, `/app`, `/how`, `/deck` |

**Stack:** Solidity 0.8.24 + Foundry + OpenZeppelin · Next.js 14, React 18, Tailwind v4, framer-motion · viem, wagmi, RainbowKit, Mezo Passport · NEAR AI (Claude) for narration · Vercel (app, API, cron).

## Roadmap

1. **Mainnet beta.** Audit `FlywheelPilot`, deploy to Mezo mainnet with a deposit cap, add a second keeper for redundancy and Telegram alerts when a plan is published.
2. **Boost market maker.** Pool boost bids across every Flywheel veBTC and add the other side: a veMEZO autopilot that votes for the best boost incentives. Flywheel then sits on both sides of Mezo's boost market.
3. **Managed veBTC for small holders.** Use Mezo managed locks so holders too small to justify gas can join a shared, Flywheel-piloted position.

## Team

Built by [0xdopewilly](https://github.com/0xdopewilly), solo: contracts, brain, keeper and frontend.

## Limits today

- Testnet only. The contract is unaudited.
- One keeper key, so a keeper outage skips a week. Owners can still vote or harvest themselves.
- A boost only rises when veMEZO holders vote for the incentives. On testnet the boost market is thin, so the brain's "bid half the value" mode is what you'll see.
- Rewards from a vote become claimable after its epoch ends. The first testnet harvests land after Thursday, Nov 19, 2026; the mainnet fork test shows the harvest path today.
