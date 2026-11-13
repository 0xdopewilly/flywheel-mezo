# Flywheel pitch video: script and shot list

Length 1:59.8 · 2560×1440 at 60 fps · H.264. Voice: Andrew (edge-tts, en-US-AndrewMultilingualNeural, +6% to +12%). Music bed: Mixkit 738, ducked under the voice.

Status: the narration below is final, and so are its timings. The site is being redesigned, so its footage will be captured again from the redesigned site. The shot list describes the site as it was before the redesign; the beats and timings stay, and its wording will be updated after the new capture.

The footage is the live site (https://flywheel-mezo.vercel.app) and Mezo's testnet explorer, recorded in slow motion and retimed to 60 fps. Every number on screen comes from the live app, the chain or a real test run. The terminal card shows real output from `FOUNDRY_PROFILE=fork forge test -vv`, run on 2026-11-13.

## Narration

The voice spells some words out (veBTC is said "vee BTC", MUSD is said "M U S D"); the captions show the written form.

| Time | Line |
|---|---|
| 0:00 | Yo, imagine this. Every Thursday, Mezo resets your veBTC votes. |
| 0:06 | Miss the window, or just follow the crowd, and your Bitcoin earns less. |
| 0:10 | 17 gauges to weigh. Incentives to claim. veMEZO votes to bid for. MUSD to reinvest. |
| 0:17 | Every. Single. Week. |
| 0:20 | So we built Flywheel: an AI autopilot for your veBTC. |
| 0:25 | Each epoch, it votes, harvests, and compounds MUSD into your boost gauge or the Savings Vault. |
| 0:32 | All inside limits you set onchain. |
| 0:34 | Your NFT never leaves your wallet. Mezo pays rewards straight to you. And you can exit any time. |
| 0:41 | Here's the live app, planning veBTC #1752, our demo position on Mezo testnet. |
| 0:47 | A water-filling optimizer weighs rewards per vote against crowding, prices boost with Mezo's own formula, and Claude explains why, with a guard that rejects any number not in the plan. |
| 0:58 | On this week's live data, the plan expects 110% more than following the crowd. |
| 1:04 | Tighten a limit, and it re-plans on the spot. |
| 1:08 | It chooses from all 17 live gauges. |
| 1:11 | Every vote publishes the full plan and reasoning onchain, in a PlanPublished event. |
| 1:17 | There's the vote on Mezo's explorer, through our verified FlywheelPilot contract. |
| 1:23 | Live on testnet: our two demo veBTC, from a separate owner wallet, with 160 MUSD compounded. |
| 1:31 | On a Mezo mainnet fork, it harvested exactly 21.0099 MUSD owed to a real veBTC, straight to its owner. The contract kept nothing. |
| 1:42 | A capped vote went through the live voter. An all-in vote? Rejected by the owner's cap. |
| 1:48 | The business: a 5% fee on compounded MUSD only. It pays for the keeper. |
| 1:54 | Flywheel. Your veBTC, on autopilot. |

## Shot list

| Time | Section | On screen |
|---|---|---|
| 0:00–0:10 | Every Thursday | No browser window. A card with the week, Mon to Sun, says every Mezo epoch starts Thursday, 00:00 UTC. On "Thursday", Thu turns red and "Every *Thursday.*" slams in. On "resets", the veBTC's two vote bars (MUSD Savings Vault, MUSD / BTC) drain to 0% and a "Votes reset" stamp lands. Next, a "Voting window" card drains to "Closed" and a "Following the crowd" card fills with voters while your share shrinks. "Your BTC earns *less.*" slams in. |
| 0:10–0:20 | The weekly grind | Four cards fly in, one per phrase. The first is 17 gauges to weigh, showing the real 17 Mezo Earn gauge names. The others are incentives to claim (fees and incentives, each with a Claim button), veMEZO votes to bid for (voting power 1× to 5×), and MUSD to reinvest (to your boost gauge or the MUSD Savings Vault). The cards then step back and "Every. Single. *Week.*" lands one word at a time. |
| 0:20–0:41 | What Flywheel does | The browser rises with the live landing page as the hero plays its entrance ("Your veBTC, on *autopilot.*"). The camera pushes into the flywheel and rings the stations Vote, Earn, Boost and Save as each is said. A stepped scroll goes to "Three steps", with "Set limits" ringed. A second scroll goes to "Your keys. Your BTC. Its limits.", with Non-custodial, Rewards paid to you by Mezo and Exit any time ringed. The cursor clicks "Open the app" in the nav. |
| 0:41–0:58 | Live on Mezo testnet | /app in demo mode for veBTC #1752. The brain's thinking state runs through its steps, then the plan lands and Claude's reasoning types in. The camera pushes into the reasoning. Cards show Mezo's boost formula, then the narrative guard. The reasoning is ringed on "Claude explains why". |
| 0:58–1:04 | | A scroll to "Where the votes go" and the expected-return panel. The camera pushes in and rings "+110% versus following the crowd". |
| 1:04–1:08 | | The cursor drags "Most in any one pool" from 60% to 35%. The plan dims ("Re-planning with your limits…"), then the new plan lands: 35% / 35% / 30% across three gauges. |
| 1:08–1:11 | | A scroll to "What it chose from", with "17 live gauges on Mezo Earn" ringed and the picks marked in red. |
| 1:11–1:17 | | A scroll to "The brain's journal, *written on-chain.*" The real PlanPublished entry for #1752 is ringed: 60% MUSD Savings Vault, 40% MUSD / BTC, expected $15.97 (+110% vs crowd), tx 0x36e5ae…08dd20, written by claude-sonnet-5-5. The cursor clicks the transaction link. |
| 1:17–1:23 | | Mezo's testnet explorer shows the vote transaction: Success · vote, from the keeper 0xe06D…5c6D, interacted with FlywheelPilot ✓. The cursor hovers FlywheelPilot (the explorer's tooltip shows 0x22cfe1B0…8550aab3) and clicks it. The contract page shows the Contract ✓ tab and "Contract name FlywheelPilot" ringed, with a "Verified on Mezo" stamp. |
| 1:23–1:31 | Proof | A card titled "Live on Mezo testnet · our demo positions". veBTC #1752 voted 60% / 40% (vote 0x36e5…8dd20) and compounded 100 MUSD: 24% boost incentives, 76% savings (0x4fed…72c6). veBTC #1753 compounded 60 MUSD. The owner (0xb833…3c09) and the keeper (0xe06D…5c6D) are separate wallets. A "160 MUSD compounded" stamp lands. |
| 1:31–1:42 | | A terminal types `FOUNDRY_PROFILE=fork forge test -vv` and prints the real mainnet and testnet fork results, highlighting `MUSD harvested to the owner (wei): 21009851199907676561`. "21.0099 MUSD" slams in: owed to a real veBTC on Mezo mainnet, paid straight to its owner, and the contract kept nothing. |
| 1:42–1:48 | | Back on the terminal, two stamps land: "70 / 30 vote went through" and "All-in vote rejected by the cap". A chips row reads 22 unit and fuzz tests · 3 testnet-fork · 2 mainnet-fork · all passing. |
| 1:48–1:54 | The business | "5% *fee.*", on compounded MUSD only. It goes to the treasury and pays for the keeper. |
| 1:54–2:00 | Flywheel | The end card shows the Flywheel mark and wordmark, "Your veBTC, on *autopilot.*", the URL pill flywheel-mezo.vercel.app, and "Non-custodial AI autopilot for Mezo veBTC · live on Mezo testnet". |

## Sources for each claim

- **Thursday, 00:00 UTC epochs:** the app's own epoch display and the "It runs every epoch" step.
- **17 live gauges:** /api/market at capture time, and the app's "17 live gauges on Mezo Earn".
- **+110% versus following the crowd:** the live plan for #1752 at capture time, which matches the on-chain journal entry ("110% more"). The narration says "on this week's live data".
- **Vote 60/40 and compound 100 MUSD (24/76) for #1752, 60 MUSD for #1753, 160 MUSD in total, the owner and keeper wallets:** the testnet transactions listed in the brief.
- **21.0099 MUSD:** test_mainnet_harvestPaysRealRewardsToOwner printed 21009851199907676561 wei, which is 21.00985 MUSD. The test also asserts that the pilot's balance stays 0.
- **The capped vote and the rejected all-in vote:** test_mainnet_brainVoteRespectsCap. It cast a 70/30 vote through the live mainnet voter, then a 100% vote reverted with PoolShareTooHigh.
- **Test counts:** `forge test` (22 passed) and `FOUNDRY_PROFILE=fork forge test` (2 mainnet-fork and 3 testnet-fork passed), both run 2026-11-13.
- **The 5% fee:** from the business model in the brief.
