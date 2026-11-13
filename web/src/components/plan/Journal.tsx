"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/ui/api";
import { useCachedQuery } from "@/lib/ui/hooks";
import { fmtDateTime, fmtEpoch, fmtSignedPct, fmtUsd, modelName, shortHex } from "@/lib/ui/format";
import type { JournalEntry } from "@/lib/ui/types";
import { PILOT_ADDRESS, txUrl } from "@/lib/mezo/chain";
import { FlywheelMark, Loader } from "@/components/brand/FlywheelMark";
import { ErrorState } from "@/components/site/States";
import { ExternalArrow } from "@/components/site/Nav";
import { Reveal } from "@/components/motion/Reveal";
import { Bar } from "./PlanCard";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Journal({ tokenId }: { tokenId: string }) {
  const q = useCachedQuery(["journal", tokenId], () => api.journal(tokenId), { refetchInterval: 60_000, staleTime: 20_000 });
  const entries = q.data?.entries ?? [];

  return (
    <section className="mt-20 md:mt-28" aria-labelledby="journal-title">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="journal-title" className="display balance text-[clamp(34px,4.4vw,56px)]">
            The brain’s journal, <span className="serif-accent energy-text">written on-chain.</span>
          </h2>
          <p className="pretty mt-4 max-w-[560px] text-[16px] leading-relaxed text-ink/70">
            Every vote publishes the full plan in a <span className="font-medium text-ink">PlanPublished</span> event. These entries are read back from
            Mezo testnet for veBTC #{tokenId}, not from our database.
          </p>
        </div>
        {q.isFetching && q.data && <Loader size={18} label="Checking for new entries" />}
      </Reveal>

      <div className="mt-10">
        {q.data && entries.length > 0 ? (
          <ol className="relative">
            <span className="absolute bottom-6 left-[15px] top-6 w-px bg-ink/10 md:left-[183px]" aria-hidden />
            {entries.map((e, i) => (
              <Entry key={`${e.tx}-${i}`} e={e} i={i} />
            ))}
          </ol>
        ) : q.error && !q.data ? (
          <div className="card p-6 sm:p-8">
            <ErrorState title="Couldn’t read the journal from Mezo" detail={(q.error as Error).message} onRetry={() => q.refetch()} />
          </div>
        ) : q.data ? (
          <div className="card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper">
              <FlywheelMark size={30} className="text-ink" />
            </div>
            <div>
              <p className="text-[17px] font-semibold tracking-[-0.015em]">No entries yet</p>
              <p className="pretty mt-1 max-w-[560px] text-[15px] leading-relaxed text-muted">
                {PILOT_ADDRESS
                  ? `The first plan lands here, on-chain, the first time the brain votes for veBTC #${tokenId}.`
                  : "The Flywheel contract is on its way to Mezo testnet. Its first published plan will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="card p-6 sm:p-8">
            <Loader label="Reading published plans from Mezo…" />
          </div>
        )}
      </div>
    </section>
  );
}

function Entry({ e, i }: { e: JournalEntry; i: number }) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const whyRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = whyRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const p = e.plan ?? ({} as JournalEntry["plan"]);
  const votes = Array.isArray(p.votes) ? p.votes : [];
  const model = modelName(p.model);
  return (
    <motion.li
      className="relative grid gap-3 pb-8 pl-11 md:grid-cols-[160px_1fr] md:gap-12 md:pl-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: Math.min(i, 4) * 0.06 }}
    >
      <span className="absolute -top-1 left-0 grid h-[31px] w-[31px] place-items-center rounded-full bg-paper md:left-[168px] md:top-5" aria-hidden>
        <FlywheelMark size={26} className="text-ink" />
      </span>
      <div className="md:pt-5 md:text-right">
        <p className="text-[13px] text-muted">Epoch from</p>
        <p className="whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em]">{fmtEpoch(e.epoch)}</p>
        <p className="tnum mt-1 whitespace-nowrap text-[13px] text-muted">Voted {fmtDateTime(e.timestamp)}</p>
      </div>
      <article className="card p-5 sm:p-7 md:ml-6">
        <h3 className="balance text-[19px] font-semibold leading-snug tracking-[-0.02em] sm:text-[21px]">{p.headline ?? "Plan published"}</h3>
        {p.why && (
          <div className="relative mt-3">
            <p ref={whyRef} className={`pretty text-[15px] leading-[1.6] text-ink/70 ${open ? "" : "line-clamp-3"}`}>
              {p.why}
            </p>
            {(clamped || open) && (
              <button type="button" onClick={() => setOpen((o) => !o)} className="link-underline mt-1 text-[13.5px] font-semibold">
                {open ? "Show less" : "Read the full reasoning"}
              </button>
            )}
          </div>
        )}
        {votes.length > 0 && (
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {votes.slice(0, 6).map((v, k) => (
              <li key={(v.pool ?? v.label) + k}>
                <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                  <span className="truncate font-medium">{v.label}</span>
                  <span className="tnum font-semibold">{Math.round(v.pct)}%</span>
                </div>
                <Bar pct={v.pct} thin delay={0.1 + k * 0.06} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4 text-[13px] text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          {typeof p.expectedUsd === "number" && (
            <span>
              Expected <span className="tnum font-semibold text-ink">{fmtUsd(p.expectedUsd)}</span>
              {p.edgePct && p.edgePct.vsCrowd !== 0 && <span className="tnum"> ({fmtSignedPct(p.edgePct.vsCrowd)} vs crowd)</span>}
            </span>
          )}
          <a href={txUrl(e.tx)} target="_blank" rel="noreferrer" className="link-underline inline-flex items-center gap-1 font-medium text-ink">
            Transaction {shortHex(e.tx, 8, 6)} <ExternalArrow />
          </a>
          <span className="tnum">Plan hash {shortHex(e.planHash, 8, 6)}</span>
          {model && <span className="text-faint sm:ml-auto">written by {model}</span>}
        </div>
      </article>
    </motion.li>
  );
}
