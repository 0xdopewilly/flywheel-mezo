"use client";

import { motion } from "framer-motion";
import { api } from "@/lib/ui/api";
import { useCachedQuery, useNow } from "@/lib/ui/hooks";
import { fmtEpoch, fmtUsd, fmtVe } from "@/lib/ui/format";
import type { GaugeSnapshot, MarketSnapshot } from "@/lib/ui/types";
import { CountUp } from "@/components/motion/CountUp";
import { Countdown } from "@/components/plan/Countdown";
import { Loader } from "@/components/brand/FlywheelMark";
import { ErrorState } from "@/components/site/States";
import { Reveal } from "@/components/motion/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;
const WEEK = 7 * 24 * 3600;

function topGauges(m: MarketSnapshot, n = 4) {
  return m.gauges
    .filter((g) => g.rewardUsd >= 0.01)
    .map((g) => ({ g, perVote: g.votes > 0 ? g.rewardUsd / g.votes : Infinity }))
    .sort((a, b) => (b.perVote === a.perVote ? b.g.rewardUsd - a.g.rewardUsd : b.perVote - a.perVote))
    .slice(0, n);
}

export function LiveStrip() {
  const q = useCachedQuery(["market"], api.market, { refetchInterval: 90_000 });
  const m = q.data;

  return (
    <section id="live" className="shell mt-16 scroll-mt-24 md:mt-24" aria-labelledby="live-title">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">This epoch on Mezo Earn</p>
          <h2 id="live-title" className="display mt-2 text-[clamp(34px,4.4vw,56px)]">
            Live <span className="energy-text">gauge board</span>
          </h2>
        </div>
        <p className="text-[13px] text-muted sm:text-right">
          {m ? (
            <>
              Read from Mezo testnet at block <span className="hud-num text-[15px] text-ink">{Number(m.block).toLocaleString("en-US")}</span>
            </>
          ) : (
            "Reading Mezo testnet…"
          )}
        </p>
      </Reveal>

      <Reveal className="hud glass mt-6 p-5 sm:p-8">
        {m ? <EpochBar m={m} /> : <div className="shimmer h-[92px]" />}
      </Reveal>

      <div className="mt-5">
        {m ? (
          <>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topGauges(m).map(({ g, perVote }, i) => (
                <GaugeCard key={g.pool} g={g} perVote={perVote} share={m.totalVotes > 0 ? g.votes / m.totalVotes : 0} i={i} />
              ))}
            </ol>
            <p className="mt-4 max-w-[760px] text-[13px] leading-relaxed text-muted">
              Per vote is what a gauge pays this epoch divided by the veBTC already voting on it. The brain weighs it against how crowded the gauge gets
              once your votes land. Prices from {m.prices.source}.
            </p>
          </>
        ) : q.error ? (
          <div className="hud p-6">
            <ErrorState title="Mezo Earn isn’t answering right now" detail={(q.error as Error).message} onRetry={() => q.refetch()} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="hud flex h-[188px] flex-col gap-3 p-5">
                {k === 0 && <Loader label="Reading every gauge…" />}
                <div className="shimmer mt-auto h-8 w-32" />
                <div className="shimmer h-2 w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** The epoch as an XP bar: where we are in the week, and when the vote window shuts. */
function EpochBar({ m }: { m: MarketSnapshot }) {
  const now = useNow(30_000) ?? m.epoch;
  const pct = Math.min(100, Math.max(0, ((now - m.epoch) / WEEK) * 100));
  const closePct = ((m.voteClosesAt - m.epoch) / WEEK) * 100;
  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-end lg:gap-10">
      <div>
        <p className="eyebrow !text-muted">Epoch from {fmtEpoch(m.epoch)}</p>
        <p className="hud-num mt-1 text-[clamp(30px,3.4vw,44px)] leading-none text-ink">
          <Countdown to={m.voteClosesAt} />
        </p>
        <p className="mt-1 text-[12.5px] uppercase tracking-[0.14em] text-gold">until voting closes</p>
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex justify-between text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted">
          <span>Thu 00:00 · epoch opens</span>
          <span className="hidden sm:inline">vote window</span>
          <span>closes Wed 23:00</span>
        </div>
        <div className="relative">
          <motion.div
            className="ticks"
            style={{ ["--fill" as string]: `${pct}%` }}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            whileInView={{ clipPath: "inset(0 0% 0 0)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          <span className="absolute -top-1 bottom-[-4px] w-[3px] bg-gold shadow-[0_0_12px_#f5b53d]" style={{ left: `${pct}%` }} aria-hidden />
          <span className="absolute -top-1 bottom-[-4px] w-px bg-ink/50" style={{ left: `${closePct}%` }} aria-hidden />
        </div>
        <p className="mt-2 text-[12px] text-muted">
          <span className="text-gold">Now</span> · {Math.round(pct)}% through the week
        </p>
      </div>
      <dl className="grid grid-cols-4 gap-5 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-3">
        {[
          ["veBTC voting", fmtVe(m.totalVotes)],
          ["Gauges", String(m.gauges.length)],
          ["BTC", fmtUsd(m.prices.btc)],
          ["MEZO", `$${Number(m.prices.mezo.toPrecision(3))}`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{k}</dt>
            <dd className="hud-num mt-0.5 text-[20px] leading-none text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function GaugeCard({ g, perVote, share, i }: { g: GaugeSnapshot; perVote: number; share: number; i: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.08 + i * 0.08 }}
      className={`hud group flex min-w-0 flex-col p-5 transition-transform duration-300 hover:-translate-y-1 ${i === 0 ? "!border-violet-hi" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="hud-num text-[12px] tracking-[0.2em] text-gold">#{i + 1}</p>
        <p className="tnum text-[12px] text-muted">{fmtUsd(g.rewardUsd)} pot</p>
      </div>
      <p className="mt-3 truncate font-[family-name:var(--font-display)] text-[19px] font-bold uppercase tracking-[0.06em] text-ink">{g.label}</p>
      <p className="hud-num mt-3 text-[34px] leading-none text-ink">
        {Number.isFinite(perVote) ? <CountUp value={perVote} format={fmtUsd} /> : <span className="text-[22px]">Unvoted</span>}
      </p>
      <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-violet-hi">{Number.isFinite(perVote) ? "per veBTC vote" : "nobody votes here yet"}</p>
      <div className="mt-auto pt-5">
        <div className="ticks !h-[10px]" style={{ ["--fill" as string]: `${Math.max(2, share * 100)}%` }} />
        <p className="tnum mt-2 text-[12px] text-muted">
          {fmtVe(g.votes)} veBTC voting · {Math.round(share * 100)}% of all votes
        </p>
      </div>
    </motion.li>
  );
}
