"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LivePlan } from "@/lib/ui/types";
import { fmtUsd } from "@/lib/ui/format";

const EASE = [0.16, 1, 0.3, 1] as const;
const WEEKS = 12;
const FEE = 0.05;

type Week = {
  n: number;
  power: number;
  rewards: number;
  harvested: number;
  reinvested: number;
  fee: number;
  boostBid: number;
  saved: number;
  totalRewards: number;
  totalSaved: number;
  totalBoost: number;
};

/**
 * Mezo epochs last a week and rewards only become claimable when one ends, so the real loop can't be sped up.
 * This replays twelve weeks of the autopilot in about a minute from this veBTC's live plan, so a tester can see
 * what the finished flywheel does. It is a projection, clearly labelled, and touches nothing onchain.
 */
function simulate(plan: LivePlan, budget: number, startMusd: number, boostTaken: boolean): Week[] {
  const base = plan.expectedUsd;
  const from = plan.boost.from || 1;
  const to = Math.max(from, plan.boost.to || from);
  const boostPct = plan.compound.boostPct / 100;
  const saving = plan.policy.autoSave;
  let wallet = startMusd;
  let pending = 0; // last week's rewards, claimable when the epoch ends
  let mult = from;
  const out: Week[] = [];
  let tr = 0;
  let ts = 0;
  let tb = 0;
  for (let n = 1; n <= WEEKS; n++) {
    // this week's vote earns in proportion to voting power (a simplification: crowding is held at today's level)
    const rewards = base * (mult / from);
    // last week's rewards are harvested now
    const harvested = pending;
    wallet += harvested;
    const reinvested = budget > 0 ? Math.min(budget, wallet) : 0;
    wallet -= reinvested;
    const fee = reinvested * FEE;
    const afterFee = reinvested - fee;
    const boostBid = saving ? afterFee * boostPct : boostPct > 0 ? afterFee : 0;
    const saved = saving ? afterFee - boostBid : 0;
    if (boostTaken && boostBid > 0.01) mult = to;
    pending = rewards;
    tr += rewards;
    ts += saved;
    tb += boostBid;
    out.push({ n, power: mult, rewards, harvested, reinvested, fee, boostBid, saved, totalRewards: tr, totalSaved: ts, totalBoost: tb });
  }
  return out;
}

export function FastForward({ plan, budget, startMusd }: { plan: LivePlan; budget: number; startMusd: number }) {
  const [boostTaken, setBoostTaken] = useState(false);
  const weeks = useMemo(() => simulate(plan, budget, startMusd, boostTaken), [plan, budget, startMusd, boostTaken]);
  const [t, setT] = useState(0); // weeks elapsed, fractional
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      // a frame's timestamp can precede the moment this effect started: never step backwards
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = Math.max(last, now);
      setT((v) => {
        const nv = v + (dt * speed) / 5; // 5 s per week at 1x
        if (nv >= WEEKS) {
          setPlaying(false);
          return WEEKS;
        }
        return nv;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed]);

  useEffect(() => {
    setT(0);
    setPlaying(false);
  }, [plan.hash, budget, boostTaken]);

  const idx = Math.max(0, Math.min(WEEKS - 1, Math.floor(t)));
  const wk = weeks[idx];
  const done = t >= WEEKS;
  const frac = t - Math.floor(t);
  const lerp = (a: number, b: number) => a + (b - a) * (done ? 1 : frac);
  const prev = idx > 0 ? weeks[idx - 1] : undefined;
  const shown = {
    rewards: t === 0 ? 0 : lerp(prev?.totalRewards ?? 0, wk.totalRewards),
    saved: t === 0 ? 0 : lerp(prev?.totalSaved ?? 0, wk.totalSaved),
    boost: t === 0 ? 0 : lerp(prev?.totalBoost ?? 0, wk.totalBoost),
  };
  const lead = plan.votes[0];
  const split = plan.votes
    .slice(0, 3)
    .map((v) => `${Math.round(v.pct)}% ${v.label}`)
    .join(" / ");

  const events = [
    { at: "Tue 20:00", text: `Votes ${split || "nothing (no rewards)"}. Plan published onchain.` },
    { at: "Thu 00:00", text: `Epoch ends: ${fmtUsd(wk.rewards)} of rewards become claimable.` },
    {
      at: "Thu 20:00",
      text:
        wk.harvested > 0
          ? `Harvests last week’s ${fmtUsd(wk.harvested)} to your wallet.`
          : "Nothing to harvest yet: the first rewards arrive after week 1 ends.",
    },
    {
      at: "Thu 20:00",
      text:
        wk.reinvested > 0
          ? `Reinvests ${wk.reinvested.toFixed(2)} MUSD: ${wk.fee.toFixed(2)} fee, ${wk.boostBid.toFixed(2)} boost bid, ${wk.saved.toFixed(2)} into savings.`
          : budget > 0
            ? "No MUSD in the wallet to reinvest this week."
            : "Reinvesting is off (no weekly budget).",
    },
  ];

  if (!lead) return null;

  return (
    <section className="hud p-5 sm:p-7" aria-labelledby="ff-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow !text-gold">Fast-forward · projection</p>
          <h3 id="ff-title" className="display mt-1.5 text-[24px] leading-none sm:text-[28px]">
            Twelve weeks in a minute
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`hud-num h-8 w-10 border text-[13px] transition-colors ${speed === s ? "border-violet-hi bg-violet/20 text-ink" : "border-line-strong text-muted hover:text-ink"}`}
            >
              {s}×
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (done) setT(0);
              setPlaying((p) => !p || done);
            }}
            className="btn btn-ink btn-sm"
          >
            {playing ? "Pause" : done ? "Replay" : t > 0 ? "Resume" : "Play"}
          </button>
        </div>
      </div>
      <p className="pretty mt-3 text-[13.5px] leading-relaxed text-muted">
        Real rewards only arrive when Mezo’s weekly epoch ends, so this replays the autopilot at speed from this veBTC’s live plan and your limits.
        It assumes this week’s gauges, prices and crowding hold. A projection, not onchain activity.
      </p>

      {/* week track */}
      <div className="mt-5">
        <div className="flex items-end justify-between">
          <p className="hud-num text-[30px] leading-none text-ink">
            Week <span className="gold-text">{String(Math.min(WEEKS, Math.floor(t) + (t > 0 ? 1 : 0)) || 0).padStart(2, "0")}</span>
            <span className="text-[16px] text-muted"> / {WEEKS}</span>
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted">
            <input type="checkbox" checked={boostTaken} onChange={(e) => setBoostTaken(e.target.checked)} className="accent-[var(--color-violet)]" />
            Assume veMEZO holders take the boost bid
          </label>
        </div>
        <div className="mt-3 grid grid-cols-12 gap-1" aria-hidden>
          {weeks.map((w, i) => {
            const fill = Math.max(0, Math.min(1, t - i));
            return (
              <div key={w.n} className="relative h-3 overflow-hidden bg-violet/15">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet to-violet-hi" style={{ width: `${fill * 100}%` }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* totals */}
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {[
          { k: "Rewards earned", v: fmtUsd(shown.rewards), c: "gold-text" },
          { k: "Saved as sMUSD", v: `${shown.saved.toFixed(2)}`, c: "text-ink" },
          { k: "Boost bids", v: `${shown.boost.toFixed(2)}`, c: "text-violet-hi" },
        ].map((x) => (
          <div key={x.k} className="border-l border-line pl-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{x.k}</dt>
            <dd className={`hud-num mt-1 text-[22px] leading-none ${x.c}`}>{x.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[12px] text-faint">
        Voting power {wk.power.toFixed(2)}× {boostTaken && plan.boost.to > plan.boost.from ? "(boost bid taken)" : ""} · budget {budget} MUSD a week ·{" "}
        {FEE * 100}% fee on reinvested MUSD only
      </p>

      {/* this week's log */}
      <div className="mt-5 border-t border-line pt-4">
        <AnimatePresence mode="wait">
          <motion.ol
            key={t === 0 ? "idle" : idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col gap-2"
          >
            {t === 0 ? (
              <li className="text-[13.5px] text-muted">Press Play to watch the loop: vote, rewards, harvest, reinvest, every week.</li>
            ) : (
              events.map((e, i) => (
                <li key={i} className="grid grid-cols-[86px_1fr] gap-3 text-[13.5px] leading-relaxed">
                  <span className="hud-num text-[13px] tracking-[0.06em] text-gold">{e.at}</span>
                  <span className="text-ink/85">{e.text}</span>
                </li>
              ))
            )}
          </motion.ol>
        </AnimatePresence>
      </div>
    </section>
  );
}
