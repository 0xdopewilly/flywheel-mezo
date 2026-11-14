# Flywheel pitch video: script and shot list

Length 1:59.4 · 2560×1440 at 60 fps · H.264. Voice: Andrew (edge-tts, en-US-AndrewMultilingualNeural, +6% to +12%). Music bed: Mixkit 738, ducked under the voice.

The footage is the site at commit deb7ad3, served locally from a production build, plus Mezo's testnet explorer. It was recorded in slow motion and retimed to 60 fps. The landing page was recorded at 0.025× so the software-rendered 3D wheel stays smooth, and /app at 0.1×.

Every number on screen comes from the live app, the chain or a real test run. The terminal card shows real output from `FOUNDRY_PROFILE=fork forge test -vv`, run on 2026-11-13. The motion graphics use the site's HUD tokens: violet-black, Rajdhani over Inter, chamfered panels, gold for value numbers.

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
| 0:40 | Here's the live app, planning veBTC #1755, a demo position our own test faucet minted. |
| 0:47 | A water-filling optimizer weighs rewards per vote against crowding, prices boost with Mezo's own formula, and Claude explains why, with a guard that rejects any number not in the plan. |
| 0:58 | On this week's live data, the plan expects about 110% more than following the crowd. |
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
| 0:00–0:10 | Every Thursday | No browser window. A card with the week, Mon to Sun, says every Mezo epoch starts Thursday, 00:00 UTC. On "Thursday", Thu lights up and "EVERY THURSDAY." slams in. On "resets", the two vote meters drain to 0% and a "VOTES RESET" stamp lands. Next, a "Voting window" card drains to "Closed" and a "Following the crowd" card fills with voters while your share shrinks. "YOUR BTC EARNS LESS." slams in. |
| 0:10–0:20 | The weekly grind | Four HUD panels fly in, one per phrase. The first is 17 gauges to weigh, showing the real Mezo Earn gauge names. The others are incentives to claim, veMEZO votes to bid for (voting power 1× to 5×), and MUSD to reinvest (your boost gauge or the MUSD Savings Vault). The panels step back and "EVERY. SINGLE. WEEK." lands one word at a time. |
| 0:20–0:40 | What Flywheel does | The browser rises on the landing hero: "YOUR veBTC, ON AUTOPILOT." with the 3D flywheel and its gold ₿ core spinning. The station carousel steps VOTE → HARVEST → BOOST → SAVE as the line says them; the cursor clicks the arrow. A stepped scroll goes to "Three steps", with "Set limits" bracketed. A second scroll goes to "Your keys. Your BTC. Its limits.", with Non-custodial, Rewards paid to you by Mezo and Exit any time bracketed. The cursor clicks LAUNCH APP. |
| 0:40–0:58 | Live on Mezo testnet | /app in demo mode for veBTC #1755. The mission panel ("Put your veBTC on autopilot", five steps for a newcomer) is bracketed, with a "5-step mission for newcomers" stamp. The brain's thinking state runs, the plan's numbers land, and a scroll goes to the plan card. Claude's full explanation types in and the camera pushes in. Panels show Mezo's boost formula, then the narrative guard. |
| 0:58–1:04 | | A scroll to "Where the votes go", the expected-return panel and the limits with their presets. The camera pushes in on "+109% versus following the crowd" (the narration says "about 110%"). |
| 1:04–1:08 | | The cursor clicks the SAFE preset (40% cap, three pools, 20% boost, 50 MUSD). A "Re-planning with your limits…" pill appears, the new numbers land (40% / 40% / 20%, +40% vs the crowd), then Claude starts writing the new explanation. |
| 1:08–1:11 | | A scroll to "What it chose from", with "17 live gauges on Mezo Earn" bracketed. |
| 1:11–1:17 | | A scroll to "The brain's journal, written on-chain." The real PlanPublished entry for #1755 is bracketed: "60% to Savings Vault, 40% to MUSD/BTC; bidding for boost", expected $1.59 (+110% vs crowd), tx 0x4390f9…0a5d68, written by claude-sonnet-5-5. The cursor clicks the transaction link. |
| 1:17–1:23 | | Mezo's testnet explorer shows that transaction (0x4390f9…5d68): Success · vote, sent by the keeper 0xe06D…5c6D to FlywheelPilot ✓. The cursor hovers FlywheelPilot (the explorer's tooltip shows the full address) and clicks it. The contract page has the Contract ✓ tab and "Contract name FlywheelPilot" bracketed, with a "Verified on Mezo" stamp. |
| 1:23–1:31 | Proof | A panel titled "Live on Mezo testnet · our demo positions". veBTC #1752 voted 60% / 40% (vote 0x36e5…8dd20) and compounded 100 MUSD: 24% boost incentives, 76% savings (0x4fed…72c6). veBTC #1753 compounded 60 MUSD. The owner (0xb833…3c09) and the keeper (0xe06D…5c6D) are separate wallets. A gold "160 MUSD compounded" stamp lands. |
| 1:31–1:42 | | A terminal types `FOUNDRY_PROFILE=fork forge test -vv` and prints the real mainnet and testnet fork results, highlighting `MUSD harvested to the owner (wei): 21009851199907676561`. "21.0099 MUSD" slams in, in gold: owed to a real veBTC on Mezo mainnet, paid straight to its owner, and the contract kept nothing. |
| 1:42–1:48 | | Back on the terminal, a green "70 / 30 vote went through" stamp and a pink "All-in vote rejected by the cap" stamp land. A chips row reads 22 unit and fuzz tests · 3 testnet-fork · 2 mainnet-fork · all passing. |
| 1:48–1:54 | The business | "5% FEE." (5% in gold), on compounded MUSD only. It goes to the treasury and pays for the keeper. |
| 1:54–2:00 | Flywheel | The end card shows the Flywheel mark and wordmark, "YOUR veBTC, ON AUTOPILOT.", the plate flywheel-mezo.vercel.app, and "Non-custodial AI autopilot for Mezo veBTC · live on Mezo testnet". |

## Sources for each claim

- **Thursday, 00:00 UTC epochs:** the app's own epoch display and the "It runs every epoch" step.
- **17 live gauges:** /api/market at capture time, and the app's "17 live gauges on Mezo Earn".
- **"About 110%" versus following the crowd:** #1755's on-chain journal entry says +110%. The live plan read +109% at capture time, because other voters move every block, so the narration says "about 110%" and keeps "on this week's live data".
- **Demo position #1755:** minted by the app's own test faucet into wallet 0x6e06…9B4A. Its vote is tx 0x4390f913…a80a5d68.
- **Vote 60/40 and compound 100 MUSD (24/76) for #1752, 60 MUSD for #1753, 160 MUSD in total, the owner and keeper wallets:** the testnet transactions in the brief.
- **21.0099 MUSD:** test_mainnet_harvestPaysRealRewardsToOwner printed 21009851199907676561 wei, which is 21.00985 MUSD. The test also asserts that the pilot's balance stays 0.
- **The capped vote and the rejected all-in vote:** test_mainnet_brainVoteRespectsCap. It cast a 70/30 vote through the live mainnet voter, then a 100% vote reverted with PoolShareTooHigh.
- **Test counts:** `forge test` (22 passed) and `FOUNDRY_PROFILE=fork forge test` (2 mainnet-fork and 3 testnet-fork passed), both run 2026-11-13.
- **The 5% fee:** from the business model in the brief.
