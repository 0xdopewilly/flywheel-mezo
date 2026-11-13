import { describe, expect, it } from "vitest";
import { allocate, baselines, expectedReward, toBps, type GaugeInput } from "./optimize";

const g = (id: string, reward: number, others: number): GaugeInput => ({ id, reward, others });

describe("allocate", () => {
  it("matches marginal returns across funded gauges (KKT)", () => {
    const gauges = [g("a", 100, 10), g("b", 50, 2), g("c", 10, 50)];
    const a = allocate(gauges, 5, { cap: 1 });
    const funded = a.votes.map((x, i) => ({ x, i })).filter((o) => o.x > 0.05);
    const marg = funded.map(({ x, i }) => (gauges[i].reward * gauges[i].others) / (gauges[i].others + x) ** 2);
    for (const m of marg) expect(m / marg[0]).toBeCloseTo(1, 1);
  });

  it("beats every naive strategy", () => {
    const gauges = [g("a", 14.3, 8.6), g("b", 6, 6.2), g("c", 2, 0.6), g("d", 0.4, 0.4), g("e", 0, 2.6)];
    const V = 1.5;
    const a = allocate(gauges, V, { cap: 1 });
    const b = baselines(gauges, V);
    expect(a.expected).toBeGreaterThanOrEqual(b.allInTop - 1e-9);
    expect(a.expected).toBeGreaterThanOrEqual(b.followCrowd - 1e-9);
    expect(a.expected).toBeGreaterThanOrEqual(b.evenSplit - 1e-9);
  });

  it("is close to a brute-force optimum on two gauges", () => {
    const gauges = [g("a", 30, 4), g("b", 18, 1)];
    const V = 3;
    let best = 0;
    for (let k = 0; k <= 3000; k++) {
      const x = (k / 3000) * V;
      best = Math.max(best, expectedReward(gauges, [x, V - x]));
    }
    expect(allocate(gauges, V, { cap: 1 }).expected).toBeGreaterThan(best * 0.999);
  });

  it("respects the per-gauge cap in the on-chain bps", () => {
    const gauges = [g("a", 1000, 1), g("b", 1, 100), g("c", 1, 100)];
    const a = allocate(gauges, 10, { cap: 0.6 });
    expect(Math.max(...a.bps)).toBeLessThanOrEqual(6000);
    expect(a.bps.reduce((s, v) => s + v, 0)).toBe(10_000);
  });

  it("honours the diversification floor", () => {
    const gauges = [g("a", 1000, 1), g("b", 1, 100), g("c", 1, 100), g("d", 0.5, 100)];
    const a = allocate(gauges, 1, { cap: 1, minPools: 3 });
    expect(a.bps.filter((b) => b > 0).length).toBeGreaterThanOrEqual(3);
  });

  it("puts a sliver, not everything, on an empty gauge that pays", () => {
    const gauges = [g("a", 50, 10), g("empty", 5, 0)];
    const a = allocate(gauges, 4, { cap: 1 });
    expect(a.votes[1]).toBeGreaterThan(0);
    expect(a.votes[1]).toBeLessThan(a.votes[0]);
  });

  it("still sums to V when too few gauges pay under the cap", () => {
    const gauges = [g("a", 10, 1), g("b", 0, 1), g("c", 0, 1)];
    const a = allocate(gauges, 1, { cap: 0.4 });
    expect(a.bps.reduce((s, v) => s + v, 0)).toBe(10_000);
    expect(Math.max(...a.bps)).toBeLessThanOrEqual(4000);
  });
});

describe("toBps", () => {
  it("sums to 10,000 and keeps funded gauges above zero", () => {
    const out = toBps([1e-6, 0.333, 0.333, 0.334, 0], 10_000);
    expect(out.reduce((s, v) => s + v, 0)).toBe(10_000);
    expect(out[0]).toBeGreaterThan(0);
    expect(out[4]).toBe(0);
  });
});
