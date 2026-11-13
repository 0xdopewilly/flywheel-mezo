import { keccak256, toBytes, type Address } from "viem";
import { allocate, baselines, type GaugeInput } from "./optimize";
import { planBoost } from "./boost";
import { narrate, template, type Narrative } from "./narrate";
import { snapshotMarket, snapshotNft, type MarketSnapshot, type NftSnapshot } from "./snapshot";

export type PolicyInput = { cap: number; minPools: number; boostShare: number; autoSave: boolean };

export const DEFAULT_POLICY: PolicyInput = { cap: 0.6, minPools: 2, boostShare: 0.3, autoSave: true };

/** The part of the plan the narrator sees and that is hashed and published on-chain. */
export type PlanCore = {
  v: 1;
  kind: "flywheel.plan";
  tokenId: string;
  epoch: number;
  block: string;
  power: { veBTC: number; boost: number };
  policy: { capPct: number; minPools: number; boostSharePct: number; autoSave: boolean };
  votes: { pool: Address; label: string; pct: number; bps: number; rewardUsd: number; othersVotes: number; expectedUsd: number }[];
  expectedUsd: number;
  baselines: { allInTop: number; followCrowd: number; evenSplit: number };
  /** How much better the plan is than each baseline, in percent (precomputed so the narrator never does maths). */
  edgePct: { vsTopPicks: number; vsCrowd: number; vsEven: number };
  boost: { spendUsd: number; from: number; to: number; extraUsd: number; netUsd: number; usdPerVeMezo: number; targetVeMezo: number; reason: string };
  harvest: { claimableUsd: number; claims: number };
  compound: { musd: number; boostPct: number; savePct: number };
  prices: { btc: number; mezo: number; source: string };
};

export type Plan = PlanCore & { narrative: Narrative; json: string; hash: `0x${string}` };

const r2 = (v: number) => Math.round(v * 100) / 100;
const r4 = (v: number) => Math.round(v * 10_000) / 10_000;
const pct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : 0);

/** Flywheel's fee on reinvested MUSD, in bps (read from the contract by the keeper; 5% is the deployed value). */
export const DEFAULT_FEE_BPS = 500;

export function buildCore(market: MarketSnapshot, nft: NftSnapshot, policy: PolicyInput, musdAvailable: number, feeBps = DEFAULT_FEE_BPS): PlanCore {
  // others = votes on the gauge minus this NFT's own current vote (if it already voted this epoch)
  const inputs: GaugeInput[] = market.gauges.map((g) => ({
    id: g.pool,
    reward: g.rewardUsd,
    others: Math.max(0, g.votes - (nft.currentVotes[g.pool] ?? 0)),
  }));
  const V = nft.power;
  const alloc = allocate(inputs, V, { cap: policy.cap, minPools: policy.minPools });
  const base = baselines(inputs, V, policy.cap);

  // Reinvest: the keeper pulls `compoundMusd`, the contract takes the fee, then splits the rest by boostPct.
  // A veBTC with no voting power (expired lock) gets nothing reinvested: there is nothing left to grow.
  const fee = feeBps / 10_000;
  const avail = V > 0 ? Math.max(0, musdAvailable) : 0;
  const afterFee = avail * (1 - fee);
  const boost = planBoost({
    gauges: inputs,
    cap: policy.cap,
    minPools: policy.minPools,
    nftUnboosted: nft.unboosted,
    currentGaugeVeMezo: nft.boostVotes,
    veBtcTotal: market.boost.veBtcTotalUnboosted,
    veMezoTotal: market.boost.veMezoTotal,
    usdPerVeMezo: market.boost.usdPerVeMezo,
    budgetUsd: afterFee * (policy.autoSave ? policy.boostShare : 1),
    marketActive: (market.boost.votedGauges ?? 1) > 0,
  });
  let compoundMusd: number;
  let boostPct: number;
  if (avail <= 0) {
    compoundMusd = 0;
    boostPct = 0;
  } else if (policy.autoSave) {
    // pull the whole available budget; boost gets exactly what the brain priced, savings gets the rest
    compoundMusd = avail;
    boostPct = Math.min(policy.boostShare, boost.spendUsd / afterFee);
  } else {
    // savings off: the contract only allows "all to boost", so pull just enough for the priced bid
    compoundMusd = boost.spendUsd > 0 ? Math.min(avail, boost.spendUsd / (1 - fee)) : 0;
    boostPct = compoundMusd > 0 ? 1 : 0;
  }

  const votes = market.gauges
    .map((g, i) => ({
      pool: g.pool,
      label: g.label,
      pct: r2(alloc.bps[i] / 100),
      bps: alloc.bps[i],
      rewardUsd: r2(g.rewardUsd),
      othersVotes: r4(inputs[i].others),
      expectedUsd: r2(alloc.votes[i] > 0 ? (g.rewardUsd * alloc.votes[i]) / (inputs[i].others + alloc.votes[i]) : 0),
    }))
    .filter((v) => v.bps > 0)
    .sort((a, b) => b.bps - a.bps);

  return {
    v: 1,
    kind: "flywheel.plan",
    tokenId: nft.tokenId,
    epoch: market.epoch,
    block: market.block,
    power: { veBTC: r4(V), boost: r2(nft.boost) },
    policy: {
      capPct: Math.round(policy.cap * 100),
      minPools: policy.minPools,
      boostSharePct: Math.round(policy.boostShare * 100),
      autoSave: policy.autoSave,
    },
    votes,
    expectedUsd: r2(alloc.expected),
    baselines: { allInTop: r2(base.allInTop), followCrowd: r2(base.followCrowd), evenSplit: r2(base.evenSplit) },
    edgePct: { vsTopPicks: pct(alloc.expected, base.allInTop), vsCrowd: pct(alloc.expected, base.followCrowd), vsEven: pct(alloc.expected, base.evenSplit) },
    boost: {
      spendUsd: r2(boost.spendUsd),
      from: r2(boost.fromMultiplier),
      to: r2(boost.toMultiplier),
      extraUsd: r2(boost.extraRewardUsd),
      netUsd: r2(boost.netUsd),
      usdPerVeMezo: Number(boost.usdPerVeMezo.toPrecision(3)),
      targetVeMezo: Math.round(boost.targetVeMezo),
      reason: boost.reason,
    },
    harvest: { claimableUsd: r2(nft.claimable.reduce((s, c) => s + c.usd, 0)), claims: nft.claimable.length },
    compound: {
      musd: Math.floor(compoundMusd * 100) / 100,
      boostPct: Math.round(boostPct * 100),
      savePct: compoundMusd > 0 && policy.autoSave ? 100 - Math.round(boostPct * 100) : 0,
    },
    prices: { btc: Math.round(market.prices.btc), mezo: Number(market.prices.mezo.toPrecision(3)), source: market.prices.source },
  };
}

export async function finalize(core: PlanCore, opts: { narrate?: boolean } = {}): Promise<Plan> {
  const narrative = opts.narrate === false ? { ...template(core), model: "template" } : await narrate(core);
  const published = { ...core, headline: narrative.headline, why: narrative.why, model: narrative.model };
  const json = JSON.stringify(published);
  return { ...core, narrative, json, hash: keccak256(toBytes(json)) };
}

export async function planFor(tokenId: bigint, policy: PolicyInput = DEFAULT_POLICY, musdAvailable = 0) {
  const market = await snapshotMarket();
  const nft = await snapshotNft(tokenId, market);
  const plan = await finalize(buildCore(market, nft, policy, musdAvailable));
  return { market, nft, plan };
}
