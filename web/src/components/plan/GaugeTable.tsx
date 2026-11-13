"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "@/lib/ui/api";
import { useCachedQuery } from "@/lib/ui/hooks";
import { fmtUsd, fmtVe } from "@/lib/ui/format";
import type { LivePlan } from "@/lib/ui/types";
import { Loader } from "@/components/brand/FlywheelMark";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Every live gauge the brain chose from this epoch, with the plan's picks marked. */
export function GaugeTable({ plan }: { plan?: LivePlan }) {
  const q = useCachedQuery(["market"], api.market, { refetchInterval: 90_000 });
  const [all, setAll] = useState(false);
  const m = q.data;
  if (!m) {
    return (
      <div className="card p-5 sm:p-7">
        {q.error ? <p className="text-[14px] text-muted">The gauge list is unavailable right now.</p> : <Loader label="Reading every gauge…" />}
      </div>
    );
  }
  const picks = new Map((plan?.votes ?? []).map((v) => [v.pool.toLowerCase(), v.pct]));
  const rows = [...m.gauges]
    .map((g) => ({ g, perVote: g.votes > 0 ? g.rewardUsd / g.votes : g.rewardUsd > 0 ? Infinity : 0 }))
    .sort((a, b) => b.g.rewardUsd - a.g.rewardUsd || b.g.votes - a.g.votes);
  const shown = all ? rows : rows.slice(0, 6);

  return (
    <section className="card p-5 sm:p-7" aria-labelledby="gauges-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="gauges-title" className="text-[17px] font-semibold tracking-[-0.015em]">
          What it chose from
        </h2>
        <p className="text-[13px] text-muted">{m.gauges.length} live gauges on Mezo Earn</p>
      </div>
      <div className="mt-4 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))] gap-x-3 border-b border-line pb-2 text-[12.5px] text-muted sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <span>Gauge</span>
          <span className="text-right">Rewards</span>
          <span className="hidden text-right sm:block">veBTC voting</span>
          <span className="text-right">Per vote</span>
        </div>
        <ul>
          {shown.map(({ g, perVote }, i) => {
            const pct = picks.get(g.pool.toLowerCase());
            return (
              <motion.li
                key={g.pool}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.03 }}
                className="tnum grid grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))] items-center gap-x-3 border-b border-line py-3 text-[14px] last:border-0 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{g.label}</span>
                  {pct !== undefined && <span className="shrink-0 border border-violet-hi/50 bg-violet/20 px-2 py-0.5 text-[11.5px] font-bold text-violet-hi">{Math.round(pct)}%</span>}
                </span>
                <span className="text-right">{fmtUsd(g.rewardUsd)}</span>
                <span className="hidden text-right text-muted sm:block">{fmtVe(g.votes)}</span>
                <span className={`text-right ${pct !== undefined ? "font-semibold" : ""}`}>{Number.isFinite(perVote) ? fmtUsd(perVote) : "unvoted"}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>
      {rows.length > 6 && (
        <button type="button" onClick={() => setAll((a) => !a)} className="link-underline mt-4 text-[13.5px] font-semibold">
          {all ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </section>
  );
}
