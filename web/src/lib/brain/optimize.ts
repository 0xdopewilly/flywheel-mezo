/**
 * The allocation core of the Flywheel brain.
 *
 * A veBTC with voting power V splits it across gauges. Gauge i pays out R_i (USD) this epoch to
 * whoever votes on it, pro rata to votes, and already carries W_i votes from everyone else. Putting
 * x_i on gauge i earns R_i * x_i / (W_i + x_i). We maximise the sum subject to
 * sum(x_i) = V and 0 <= x_i <= cap * V.
 *
 * The objective is concave, so the KKT conditions give the optimum directly: every funded gauge
 * ends at the same marginal return lambda, where R_i W_i / (W_i + x_i)^2 = lambda, i.e.
 * x_i = sqrt(R_i W_i / lambda) - W_i, clipped to [0, cap V]. We find lambda by bisection
 * ("water-filling").
 */

export type GaugeInput = {
  id: string;
  /** USD this gauge is expected to pay its voters this epoch. */
  reward: number;
  /** Votes already on the gauge from everyone else (same unit as V). */
  others: number;
};

export type Allocation = {
  /** Vote amount per gauge, same order as the input. */
  votes: number[];
  /** Integer basis points per gauge summing to 10,000 (what goes on-chain). */
  bps: number[];
  /** Expected USD for this veBTC under the allocation. */
  expected: number;
  /** The common marginal return per unit of vote at the optimum. */
  lambda: number;
};

export type AllocateOptions = {
  /** Largest share of V per gauge, 0..1. */
  cap: number;
  /** At least this many gauges get a vote (0 = no floor). */
  minPools?: number;
  /** At most this many gauges (Mezo allows 30). */
  maxPools?: number;
};

export function expectedReward(gauges: GaugeInput[], votes: number[]): number {
  let s = 0;
  gauges.forEach((g, i) => {
    const x = votes[i] ?? 0;
    if (x > 0 && g.reward > 0) s += (g.reward * x) / (g.others + x);
  });
  return s;
}

export function allocate(gauges: GaugeInput[], V: number, opts: AllocateOptions): Allocation {
  const n = gauges.length;
  if (n === 0 || V <= 0) return { votes: new Array(n).fill(0), bps: new Array(n).fill(0), expected: 0, lambda: 0 };
  const capV = Math.min(1, Math.max(opts.cap, 1e-9)) * V;
  const eps = V * 1e-9;
  const W = gauges.map((g) => Math.max(g.others, eps));
  const R = gauges.map((g) => Math.max(g.reward, 0));

  const xAt = (lambda: number) =>
    R.map((r, i) => (r <= 0 ? 0 : Math.min(capV, Math.max(0, Math.sqrt((r * W[i]) / lambda) - W[i]))));
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

  let votes: number[];
  let lambda = 0;
  const maxFill = sum(R.map((r) => (r > 0 ? capV : 0)));
  if (maxFill < V) {
    // Not enough paying gauges under the cap: fill every paying gauge to the cap, then spread the
    // rest over the remaining gauges (they earn nothing but the vote must add up).
    votes = R.map((r) => (r > 0 ? capV : 0));
    let rest = V - sum(votes);
    const idle = R.map((r, i) => (r > 0 ? -1 : i)).filter((i) => i >= 0);
    for (const i of idle) {
      if (rest <= 0) break;
      const add = Math.min(capV, rest);
      votes[i] += add;
      rest -= add;
    }
  } else {
    let lo = 1e-30;
    let hi = Math.max(...R.map((r, i) => r / W[i])) * 1.0001 + 1e-30;
    for (let k = 0; k < 200; k++) {
      const mid = Math.sqrt(lo * hi); // geometric bisection: lambda spans many orders of magnitude
      if (sum(xAt(mid)) > V) lo = mid;
      else hi = mid;
    }
    lambda = hi;
    votes = xAt(hi);
    // the clipped water level can leave a hair of V unplaced; give it to the best uncapped gauge
    const gap = V - sum(votes);
    if (gap > 0) {
      const order = votes
        .map((x, i) => ({ i, m: R[i] > 0 ? (R[i] * W[i]) / (W[i] + x) ** 2 : 0, room: capV - x }))
        .filter((o) => o.room > 0)
        .sort((a, b) => b.m - a.m);
      let rest = gap;
      for (const o of order) {
        const add = Math.min(o.room, rest);
        votes[o.i] += add;
        rest -= add;
        if (rest <= 0) break;
      }
    }
  }

  // diversification floor: fund the next-best gauges with a sliver each
  const minPools = Math.min(opts.minPools ?? 0, n);
  let funded = votes.filter((x) => x > 0).length;
  if (funded < minPools) {
    const sliver = V * 0.01;
    const candidates = R.map((r, i) => ({ i, m: r / (W[i] + sliver) }))
      .filter((c) => votes[c.i] === 0)
      .sort((a, b) => b.m - a.m);
    for (const c of candidates) {
      if (funded >= minPools) break;
      votes[c.i] = sliver;
      funded++;
    }
    const total = sum(votes);
    votes = votes.map((x) => (x * V) / total);
  }

  // Mezo caps a vote at maxPools gauges: keep the biggest
  const maxPools = opts.maxPools ?? 30;
  if (votes.filter((x) => x > 0).length > maxPools) {
    const keep = new Set(
      votes
        .map((x, i) => ({ x, i }))
        .sort((a, b) => b.x - a.x)
        .slice(0, maxPools)
        .map((o) => o.i),
    );
    votes = votes.map((x, i) => (keep.has(i) ? x : 0));
    const total = sum(votes);
    votes = votes.map((x) => (x * V) / total);
  }

  const bps = toBps(votes, Math.floor(opts.cap * 10_000));
  const onChainVotes = bps.map((b) => (b * V) / 10_000);
  return { votes: onChainVotes, bps, expected: expectedReward(gauges, onChainVotes), lambda };
}

/**
 * Integer basis points that sum to exactly 10,000, keep every funded gauge above zero and never
 * exceed capBps (the contract checks weight * 10000 <= cap * total).
 */
export function toBps(votes: number[], capBps: number): number[] {
  const total = votes.reduce((s, v) => s + v, 0);
  if (total <= 0) return votes.map(() => 0);
  const raw = votes.map((v) => (v / total) * 10_000);
  const out = raw.map((r, i) => (votes[i] > 0 ? Math.max(1, Math.floor(r)) : 0));
  let diff = 10_000 - out.reduce((s, v) => s + v, 0);
  const byRemainder = raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .filter((o) => votes[o.i] > 0)
    .sort((a, b) => b.rem - a.rem);
  let k = 0;
  while (diff > 0 && byRemainder.length) {
    const o = byRemainder[k % byRemainder.length];
    if (out[o.i] < capBps) {
      out[o.i]++;
      diff--;
    }
    k++;
    if (k > 100_000) break;
  }
  while (diff < 0) {
    const i = out.indexOf(Math.max(...out));
    out[i]--;
    diff++;
  }
  // enforce the cap strictly, pushing any excess to gauges with room
  for (let i = 0; i < out.length; i++) {
    if (out[i] > capBps) {
      let excess = out[i] - capBps;
      out[i] = capBps;
      for (let j = 0; j < out.length && excess > 0; j++) {
        if (j !== i && out[j] > 0 && out[j] < capBps) {
          const add = Math.min(capBps - out[j], excess);
          out[j] += add;
          excess -= add;
        }
      }
    }
  }
  return out;
}

/** The strategies a person might use by hand, under the same per-gauge cap, for comparison. */
export function baselines(gauges: GaugeInput[], V: number, cap = 1) {
  const n = gauges.length;
  // "top picks": fill the gauge with the best headline reward per vote up to the cap, then the next
  const ranked = gauges.map((g, i) => ({ i, y: g.reward / Math.max(g.others, 1e-12) })).sort((a, b) => b.y - a.y);
  const allIn = new Array(n).fill(0);
  let rest = V;
  for (const r of ranked) {
    if (rest <= 0) break;
    const put = Math.min(rest, cap * V);
    allIn[r.i] = put;
    rest -= put;
  }
  const crowdTotal = gauges.reduce((s, g) => s + g.others, 0);
  const crowd = gauges.map((g) => (crowdTotal > 0 ? (g.others / crowdTotal) * V : V / n));
  const paying = gauges.filter((g) => g.reward > 0).length || n;
  const even = gauges.map((g) => (g.reward > 0 || paying === n ? V / paying : 0));
  return {
    allInTop: expectedReward(gauges, allIn),
    followCrowd: expectedReward(gauges, crowd),
    evenSplit: expectedReward(gauges, even),
  };
}
