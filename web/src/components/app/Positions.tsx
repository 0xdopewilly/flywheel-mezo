"use client";

import { motion } from "framer-motion";
import { DEMO_TOKEN_ID, type Position } from "@/lib/ui/types";
import { fmtDay, fmtMult, fmtVe } from "@/lib/ui/format";
import { ErrorState } from "@/components/site/States";
import { Loader } from "@/components/brand/FlywheelMark";
import { Shell } from "./EnablePanel";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Positions({
  positions,
  loading,
  error,
  onRetry,
  selected,
  onSelect,
  onPreviewDemo,
}: {
  positions?: Position[];
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  selected: string | null;
  onSelect: (id: string) => void;
  onPreviewDemo: () => void;
}) {
  return (
    <Shell title="Your veBTC" right={loading && positions ? <Loader size={18} /> : undefined}>
      {!positions && loading ? (
        <div className="flex flex-col gap-3">
          <Loader label="Looking for veBTC in this wallet…" />
          <div className="shimmer h-[76px] rounded-[20px]" />
        </div>
      ) : !positions && error ? (
        <ErrorState title="Couldn’t read your veBTC" detail={(error as Error).message} onRetry={onRetry} />
      ) : positions && positions.length === 0 ? (
        <div>
          <p className="text-[15px] font-semibold">No veBTC in this wallet on Mezo testnet</p>
          <p className="pretty mt-1.5 text-[14px] leading-relaxed text-muted">
            Lock BTC in Mezo Earn to get one. Until then, the brain’s plan for veBTC #{DEMO_TOKEN_ID} is shown read-only.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://mezo.org" target="_blank" rel="noreferrer" className="btn btn-ink btn-sm">
              Go to Mezo
            </a>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onPreviewDemo}>
              Keep previewing #{DEMO_TOKEN_ID}
            </button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Choose a veBTC">
          {positions?.map((p, i) => {
            const on = p.tokenId === selected;
            return (
              <motion.li key={p.tokenId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(p.tokenId)}
                  className={`focus-ring w-full rounded-[20px] p-4 text-left transition-[background-color,box-shadow] duration-300 ${
                    on ? "bg-white shadow-[inset_0_0_0_2px_#171717]" : "bg-paper hover:bg-paper-deep"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[16px] font-semibold tracking-[-0.015em]">veBTC #{p.tokenId}</span>
                    <StatusChip p={p} />
                  </div>
                  <p className="tnum mt-1.5 text-[13px] leading-relaxed text-muted">
                    {fmtVe(p.power)} veBTC of votes, {fmtMult(p.boost)} boost, {p.permanent ? "permanent lock" : `unlocks ${fmtDay(p.lockEnd)}`}
                  </p>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}

function StatusChip({ p }: { p: Position }) {
  if (p.enrolled && p.live) return <span className="rounded-full bg-lime px-2.5 py-0.5 text-[12px] font-semibold">On autopilot</span>;
  if (p.enrolled) return <span className="rounded-full bg-sand px-2.5 py-0.5 text-[12px] font-semibold">Paused</span>;
  return <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[12px] font-medium text-muted">Not enrolled</span>;
}
