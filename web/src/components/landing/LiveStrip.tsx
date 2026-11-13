"use client";

import { motion } from "framer-motion";
import { api } from "@/lib/ui/api";
import { useCachedQuery } from "@/lib/ui/hooks";
import { fmtUsd, fmtVe } from "@/lib/ui/format";
import type { GaugeSnapshot, MarketSnapshot } from "@/lib/ui/types";
import { CountUp } from "@/components/motion/CountUp";
import { Countdown } from "@/components/plan/Countdown";
import { Bar } from "@/components/plan/PlanCard";
import { Loader } from "@/components/brand/FlywheelMark";
import { ErrorState } from "@/components/site/States";
import { Reveal } from "@/components/motion/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

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
    <section className="shell" aria-labelledby="live-title">
      <Reveal className="card overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(260px,0.75fr)_2fr]">
          <div className="flex flex-col justify-between gap-6 bg-ink p-6 text-white sm:p-8">
            <div>
              <h2 id="live-title" className="text-[20px] font-semibold tracking-[-0.02em]">
                This epoch on <span className="serif-accent text-[1.15em]">Mezo Earn</span>
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/60">
                {m ? (
                  <>
                    Read live from Mezo testnet at block <span className="tnum text-white/80">{Number(m.block).toLocaleString("en-US")}</span>
                  </>
                ) : (
                  "Reading Mezo testnet…"
                )}
              </p>
            </div>
            <div>
              <p className="text-[14px] text-white/60">Voting closes in</p>
              <p className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.035em] sm:text-[40px]">
                {m ? <Countdown to={m.voteClosesAt} /> : <span className="inline-block h-9 w-48 rounded-lg bg-white/10" />}
              </p>
              {m && (
                <dl className="tnum mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-[13px]">
                  <div>
                    <dt className="text-white/50">veBTC voting</dt>
                    <dd className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-white">{fmtVe(m.totalVotes)}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50">Gauges open</dt>
                    <dd className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-white">{m.gauges.length}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50">BTC</dt>
                    <dd className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-white">{fmtUsd(m.prices.btc)}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50">MEZO</dt>
                    <dd className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-white">${Number(m.prices.mezo.toPrecision(3))}</dd>
                  </div>
                </dl>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {m ? (
              <>
                <div className="mb-5 flex items-baseline justify-between gap-4">
                  <p className="text-[15px] font-semibold tracking-[-0.01em]">Best rewards per vote right now</p>
                  {q.isFetching && <Loader size={16} />}
                </div>
                <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {topGauges(m).map(({ g, perVote }, i) => (
                    <GaugeRow key={g.pool} g={g} perVote={perVote} share={m.totalVotes > 0 ? g.votes / m.totalVotes : 0} i={i} />
                  ))}
                </ol>
                <p className="mt-6 text-[13px] leading-relaxed text-muted">
                  Rewards per vote is what a gauge pays this epoch divided by the veBTC already voting on it. The brain weighs it against how
                  crowded the gauge would get with your votes added. Prices from {m.prices.source}.
                </p>
              </>
            ) : q.error ? (
              <ErrorState title="Mezo Earn isn’t answering right now" detail={(q.error as Error).message} onRetry={() => q.refetch()} />
            ) : (
              <div className="flex h-full min-h-[220px] flex-col justify-center gap-5">
                <Loader label="Reading every gauge on Mezo Earn…" />
                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2" aria-hidden>
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} className="flex flex-col gap-2">
                      <div className="shimmer h-4 w-32 rounded-md" />
                      <div className="shimmer h-8 w-40 rounded-lg" />
                      <div className="shimmer h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function GaugeRow({ g, perVote, share, i }: { g: GaugeSnapshot; perVote: number; share: number; i: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.08 }}
      className="min-w-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{g.label}</p>
        <p className="tnum shrink-0 text-[13px] text-muted">{fmtUsd(g.rewardUsd)} pot</p>
      </div>
      <p className="mt-1.5 text-[30px] font-semibold leading-none tracking-[-0.035em]">
        {Number.isFinite(perVote) ? <CountUp value={perVote} format={fmtUsd} /> : <span className="text-[22px]">Unvoted</span>}
        <span className="ml-1.5 text-[14px] font-medium tracking-normal text-muted">{Number.isFinite(perVote) ? "per veBTC vote" : "nobody votes here yet"}</span>
      </p>
      <Bar pct={share * 100} thin tone="ink" delay={0.2 + i * 0.08} />
      <p className="tnum mt-1.5 text-[12.5px] text-muted">
        {fmtVe(g.votes)} veBTC voting, {Math.round(share * 100)}% of all votes
      </p>
    </motion.li>
  );
}
