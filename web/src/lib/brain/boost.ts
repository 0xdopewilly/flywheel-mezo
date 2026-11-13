import { allocate, type GaugeInput } from "./optimize";

/** Mezo's boost: min(5, 1 + 4 * (veBTC_total / veBTC_nft) * (veMEZO_on_gauge / veMEZO_total)). */
export function boostMultiplier(veBtcTotal: number, nftUnboosted: number, gaugeVeMezo: number, veMezoTotal: number) {
  if (nftUnboosted <= 0 || veMezoTotal <= 0) return 1;
  return Math.min(5, 1 + 4 * (veBtcTotal / nftUnboosted) * (gaugeVeMezo / veMezoTotal));
}

/** veMEZO votes needed on the gauge to reach a target multiplier. */
export function veMezoForMultiplier(target: number, veBtcTotal: number, nftUnboosted: number, veMezoTotal: number) {
  const t = Math.min(5, Math.max(1, target));
  return ((t - 1) / 4) * (nftUnboosted / veBtcTotal) * veMezoTotal;
}

export type BoostDecision = {
  /** USD of MUSD to post as incentives on the veBTC's own boost gauge (0 = don't boost). */
  spendUsd: number;
  fromMultiplier: number;
  toMultiplier: number;
  extraRewardUsd: number;
  netUsd: number;
  /** USD per veMEZO vote the market currently pays. */
  usdPerVeMezo: number;
  curve: { spend: number; multiplier: number; net: number }[];
  reason: "profitable" | "bid_half_value" | "not_worth_it" | "no_budget" | "at_max" | "market_idle";
  /** veMEZO votes the bid is aiming to attract (bid mode) or expected to attract (priced mode). */
  targetVeMezo: number;
};

/**
 * Should the veBTC buy boost this epoch? Spending S on incentives attracts roughly S / p veMEZO
 * votes (p = what the market pays per vote), which lifts the multiplier and therefore the veBTC's
 * share of every gauge it votes on. We search S in [0, budget] for the best net = extra reward - S.
 */
export function planBoost(args: {
  gauges: GaugeInput[];
  cap: number;
  minPools: number;
  nftUnboosted: number;
  currentGaugeVeMezo: number;
  veBtcTotal: number;
  veMezoTotal: number;
  usdPerVeMezo: number;
  budgetUsd: number;
  /** Are veMEZO holders voting on any boost gauge this epoch? If not, incentives would sit unclaimed. */
  marketActive?: boolean;
}): BoostDecision {
  const { gauges, cap, minPools, nftUnboosted, currentGaugeVeMezo, veBtcTotal, veMezoTotal, usdPerVeMezo, budgetUsd, marketActive = true } = args;
  const from = boostMultiplier(veBtcTotal, nftUnboosted, currentGaugeVeMezo, veMezoTotal);
  const base = allocate(gauges, nftUnboosted * from, { cap, minPools }).expected;
  const empty = (reason: BoostDecision["reason"]): BoostDecision => ({
    spendUsd: 0,
    fromMultiplier: from,
    toMultiplier: from,
    extraRewardUsd: 0,
    netUsd: 0,
    usdPerVeMezo,
    curve: [],
    reason,
    targetVeMezo: 0,
  });
  if (from >= 4.999) return empty("at_max");
  if (budgetUsd <= 0) return empty("no_budget");

  // Incentives on a boost gauge are paid to the veMEZO that votes for it. If nobody votes boosts at all,
  // a bid would sit unclaimed (and in reward contracts like these, an epoch with no votes can't be claimed later).
  if (usdPerVeMezo <= 0 && !marketActive && currentGaugeVeMezo <= 0) return empty("market_idle");

  if (usdPerVeMezo <= 0) {
    // Nobody is paying veMEZO voters this epoch, so there is no price to follow. Bid half of what
    // the extra boost is worth to this veBTC: any veMEZO that takes the bid leaves the owner ahead.
    const curve: BoostDecision["curve"] = [];
    let best: { m: number; bid: number; extra: number; need: number } | null = null;
    for (const m of [1.25, 1.5, 2, 2.5, 3, 4, 5]) {
      if (m <= from) continue;
      const need = veMezoForMultiplier(m, veBtcTotal, nftUnboosted, veMezoTotal) - currentGaugeVeMezo;
      const extra = allocate(gauges, nftUnboosted * m, { cap, minPools }).expected - base;
      const bid = Math.min(budgetUsd, extra / 2);
      curve.push({ spend: bid, multiplier: m, net: extra - bid });
      if (bid > 0 && bid >= extra / 2 - 1e-9 && (!best || extra - bid > best.extra - best.bid)) best = { m, bid, extra, need };
    }
    if (!best || best.bid < 0.01) return { ...empty("not_worth_it"), curve };
    return {
      spendUsd: best.bid,
      fromMultiplier: from,
      toMultiplier: best.m,
      extraRewardUsd: best.extra,
      netUsd: best.extra - best.bid,
      usdPerVeMezo: best.need > 0 ? best.bid / best.need : 0,
      curve,
      reason: "bid_half_value",
      targetVeMezo: best.need,
    };
  }

  const steps = 40;
  const curve: BoostDecision["curve"] = [];
  let best = { spend: 0, multiplier: from, net: 0, extra: 0 };
  for (let k = 1; k <= steps; k++) {
    const spend = (budgetUsd * k) / steps;
    const m = boostMultiplier(veBtcTotal, nftUnboosted, currentGaugeVeMezo + spend / usdPerVeMezo, veMezoTotal);
    const extra = allocate(gauges, nftUnboosted * m, { cap, minPools }).expected - base;
    const net = extra - spend;
    curve.push({ spend, multiplier: m, net });
    if (net > best.net) best = { spend, multiplier: m, net, extra };
  }
  if (best.spend === 0) return { ...empty("not_worth_it"), curve };
  return {
    spendUsd: best.spend,
    fromMultiplier: from,
    toMultiplier: best.multiplier,
    extraRewardUsd: best.extra,
    netUsd: best.net,
    usdPerVeMezo,
    curve,
    reason: "profitable",
    targetVeMezo: best.spend / usdPerVeMezo,
  };
}
