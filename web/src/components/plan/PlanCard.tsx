"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { TypeText } from "@/components/motion/TypeText";
import { Loader } from "@/components/brand/FlywheelMark";
import { ErrorState } from "@/components/site/States";
import { ApiError } from "@/lib/ui/api";
import { BOOST_REASON, fmtEpoch, fmtMult, fmtSignedPct, fmtUsd, fmtVe, modelName, shortHex } from "@/lib/ui/format";
import type { LivePlan, PlanResponse } from "@/lib/ui/types";
import { Thinking } from "./Thinking";

const EASE = [0.16, 1, 0.3, 1] as const;
// Plum tail, red head: the visible tip of every bar is the bright end, like the comet in the hero.
export const ENERGY = "linear-gradient(90deg, #6D28D9 0%, #8B5CF6 55%, #B69CFF 100%)";

type Props = {
  tokenId: string;
  data?: PlanResponse;
  error?: unknown;
  isFetching?: boolean;
  /** numbers are in; Claude is still writing the explanation */
  narrating?: boolean;
  onRetry?: () => void;
  /** smaller paddings for the landing page */
  variant?: "full" | "landing";
};

export function PlanCard({ tokenId, data, error, isFetching, narrating = false, onRetry, variant = "full" }: Props) {
  const pad = variant === "landing" ? "p-6 sm:p-8" : "p-5 sm:p-8 lg:p-10";
  return (
    <div className={`card relative overflow-hidden ${pad}`}>
      <AnimatePresence mode="wait" initial={false}>
        {data ? (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <PlanBody data={data} refreshing={!!isFetching} narrating={narrating} variant={variant} />
          </motion.div>
        ) : error ? (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ErrorState
              title={error instanceof ApiError && error.status === 404 ? "No such veBTC on Mezo testnet" : "The brain couldn’t reach Mezo just now"}
              detail={error instanceof Error ? error.message : undefined}
              onRetry={onRetry}
            />
          </motion.div>
        ) : (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Thinking tokenId={tokenId} compact={variant === "landing"} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanBody({ data, refreshing, narrating, variant }: { data: PlanResponse; refreshing: boolean; narrating: boolean; variant: "full" | "landing" }) {
  const { plan, market } = data;
  const model = modelName(plan.narrative.model);
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="border border-violet-hi/40 bg-violet/15 px-3 py-1 font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.14em] text-violet-hi">
            <span className="normal-case">ve</span>BTC #{plan.tokenId}
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Epoch from {fmtEpoch(plan.epoch)}</span>
        </div>
        <div className="h-6 text-[13px] text-muted">
          <AnimatePresence mode="wait" initial={false}>
            {refreshing ? (
              <motion.span key="r" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex">
                <Loader size={18} label="Re-planning" className="!text-[13px]" />
              </motion.span>
            ) : (
              <motion.span key="b" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="tnum inline-block leading-6">
                Computed live at block {Number(market.block).toLocaleString("en-US")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div animate={{ opacity: refreshing ? 0.55 : 1 }} transition={{ duration: 0.3 }}>
        <h3 className="display balance mt-6 text-[27px] leading-[1.02] sm:text-[36px]">{plan.narrative.headline}</h3>
        <TypeText key={plan.narrative.why} text={plan.narrative.why} className="pretty mt-4 text-[15.5px] leading-[1.68] text-ink/75 sm:text-[16px]" />
        {narrating && (
          <p className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-hi">
            <Loader size={14} /> Claude is writing the full explanation…
          </p>
        )}

        <Allocation votes={plan.votes} />

        <Outcome plan={plan} />

        {variant === "full" && <Loop plan={plan} />}
      </motion.div>

      <div className="mt-8 flex flex-col gap-1.5 border-t border-line pt-5 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          Plan hash <span className="tnum font-medium text-ink">{shortHex(plan.hash, 10, 6)}</span>, the exact text it publishes on-chain with its vote
        </span>
        {model && <span className="text-faint">written by {model}</span>}
      </div>
    </div>
  );
}

export function Allocation({ votes, compact = false }: { votes: LivePlan["votes"]; compact?: boolean }) {
  if (!votes.length) {
    return <p className="mt-8 text-[15px] text-muted">No gauge pays anything this epoch, so the brain holds its votes.</p>;
  }
  return (
    <div className={compact ? "mt-5" : "mt-9"}>
      {!compact && (
        <div className="mb-4 flex items-baseline justify-between">
          <p className="eyebrow">Where the votes go</p>
          <p className="text-[12px] uppercase tracking-[0.12em] text-muted">share of this veBTC’s votes</p>
        </div>
      )}
      <ul className={`flex flex-col ${compact ? "gap-3.5" : "gap-5"}`}>
        <AnimatePresence initial={false}>
          {votes.map((v, i) => (
            <motion.li
              key={v.pool}
              layout="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className={`truncate font-[family-name:var(--font-display)] font-bold uppercase tracking-[0.06em] ${compact ? "text-[14px]" : "text-[17px]"}`}>{v.label}</span>
                <span className={`hud-num shrink-0 ${compact ? "text-[16px]" : "text-[26px]"}`}>
                  <CountUp value={v.pct} format={(x) => `${Math.round(x)}%`} duration={1.1} />
                </span>
              </div>
              <Bar pct={v.pct} delay={0.12 + i * 0.08} thin={compact} />
              {!compact && (
                <p className="tnum mt-2 text-[13px] leading-relaxed text-muted">
                  {fmtUsd(v.rewardUsd)} in rewards, {fmtVe(v.othersVotes)} veBTC already voting
                  {v.expectedUsd > 0 ? <>, your share about {fmtUsd(v.expectedUsd)}</> : null}
                </p>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/** A bar that grows in with a transform only (the fill slides out from behind the track's edge). */
export function Bar({ pct, delay = 0, thin = false, tone = "energy" }: { pct: number; delay?: number; thin?: boolean; tone?: "energy" | "ink" | "muted" }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  const bg = tone === "energy" ? ENERGY : tone === "ink" ? "#F1ECFF" : "rgba(241,236,255,0.22)";
  const target = `${Math.min(100, Math.max(0, pct)) - 100}%`;
  return (
    <div ref={ref} className={`relative mt-2 w-full overflow-hidden bg-violet/[0.14] ${thin ? "h-2" : "h-3.5"}`}>
      <motion.div
        className="absolute inset-0"
        style={{ background: bg, boxShadow: tone === "energy" ? "0 0 14px rgba(139,92,246,0.55)" : undefined }}
        initial={{ x: "-100%" }}
        animate={{ x: seen ? target : "-100%" }}
        transition={{ duration: 1.1, ease: EASE, delay: seen ? delay : 0 }}
      />
      {/* segment cuts, so every bar reads as a HUD meter */}
      <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_5px,#0e0819_5px_7px)]" aria-hidden />
    </div>
  );
}

function Outcome({ plan }: { plan: LivePlan }) {
  const rows = [
    { label: "Flywheel’s plan", v: plan.expectedUsd, tone: "energy" as const },
    { label: "Following the crowd", v: plan.baselines.followCrowd, tone: "muted" as const },
    { label: "Splitting evenly", v: plan.baselines.evenSplit, tone: "muted" as const },
  ];
  const max = Math.max(...rows.map((r) => r.v), 1e-9);
  const edge = plan.edgePct.vsCrowd;
  return (
    <div className="mt-9 grid gap-6 border border-violet-hi/20 bg-paper/60 p-5 sm:grid-cols-[0.8fr_1.2fr] sm:p-6 [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
      <div>
        <p className="eyebrow !text-muted">Expected this epoch</p>
        <p className="hud-num gold-text mt-1 text-[48px] leading-none">
          <CountUp value={plan.expectedUsd} format={fmtUsd} />
        </p>
        {plan.baselines.followCrowd > 0 && edge !== 0 && (
          <p className="mt-3 text-[14px] leading-snug text-ink/80">
            <span className="hud-num text-[17px] text-ok">{fmtSignedPct(edge)}</span> versus following the crowd
          </p>
        )}
      </div>
      <ul className="flex flex-col justify-center gap-3">
        {rows.map((r, i) => (
          <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
            <span className={`text-[12px] uppercase tracking-[0.1em] ${i === 0 ? "font-semibold text-ink" : "text-muted"}`}>{r.label}</span>
            <span className={`tnum text-[13px] ${i === 0 ? "font-semibold" : "text-muted"}`}>{fmtUsd(r.v)}</span>
            <div className="col-span-2 -mt-1">
              <Bar pct={(r.v / max) * 100} delay={0.15 + i * 0.1} thin tone={r.tone} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Loop({ plan }: { plan: LivePlan }) {
  const reinvest = plan.compound.musd;
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      <Tile title="Rewards to claim">
        <p className="hud-num text-[28px] leading-none">{fmtUsd(plan.harvest.claimableUsd)}</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          {plan.harvest.claims > 0 ? `From ${plan.harvest.claims} reward ${plan.harvest.claims === 1 ? "pot" : "pots"}, paid by Mezo to your wallet.` : "Nothing waiting yet. Rewards arrive after the epoch ends."}
        </p>
      </Tile>
      <Tile title="Voting power boost">
        <p className="hud-num text-[28px] leading-none">
          {fmtMult(plan.boost.from)}
          {plan.boost.to !== plan.boost.from && (
            <>
              <span className="mx-1.5 text-faint">→</span>
              <span className="gold-text">{fmtMult(plan.boost.to)}</span>
            </>
          )}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-muted">{BOOST_REASON[plan.boost.reason] ?? plan.boost.reason}</p>
      </Tile>
      <Tile title="MUSD to reinvest">
        <p className="hud-num text-[28px] leading-none">{reinvest > 0 ? `${reinvest.toLocaleString("en-US", { maximumFractionDigits: 2 })} MUSD` : "None yet"}</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          {reinvest > 0
            ? `${plan.compound.boostPct}% buys boost${plan.policy.autoSave ? `, ${plan.compound.savePct}% goes to the Savings Vault as sMUSD for you` : ""}.`
            : "With a reinvest budget, MUSD splits between boost and the Savings Vault."}
        </p>
      </Tile>
    </div>
  );
}

function Tile({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-violet-hi/15 bg-paper/60 p-5 [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
      <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-violet-hi">{title}</p>
      {children}
    </div>
  );
}
