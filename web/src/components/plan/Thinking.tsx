"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FlywheelMark } from "@/components/brand/FlywheelMark";

const STEPS = [
  "Reading every Mezo Earn gauge",
  "Checking this veBTC’s voting power",
  "Weighing rewards per vote against crowding",
  "Pricing boost against veMEZO",
  "Writing the reasoning in plain English",
];

/** The brain's loading state: honest steps of what the server is doing, and how long it has taken. */
export function Thinking({ tokenId, compact = false }: { tokenId: string; compact?: boolean }) {
  const [i, setI] = useState(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const a = setInterval(() => setI((v) => Math.min(v + 1, STEPS.length - 1)), 2600);
    const b = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  return (
    <div className={`flex flex-col ${compact ? "gap-5" : "gap-8"}`} role="status" aria-live="polite">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper">
          <FlywheelMark size={34} spinning className="text-ink" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">The brain is planning veBTC #{tokenId}</p>
          <div className="relative mt-0.5 h-[22px] overflow-hidden text-[14px] text-muted">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={i}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="truncate"
              >
                {STEPS[i]}…
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <span className="tnum ml-auto shrink-0 text-[13px] text-faint">{secs}s</span>
      </div>
      <div className="flex flex-col gap-3" aria-hidden>
        <div className="shimmer h-7 w-[82%] rounded-[3px]" />
        <div className="shimmer h-4 w-full rounded-md" />
        <div className="shimmer h-4 w-[92%] rounded-md" />
        <div className="shimmer h-4 w-[64%] rounded-md" />
      </div>
      {!compact && (
        <div className="flex flex-col gap-4" aria-hidden>
          {[78, 46, 22].map((w, k) => (
            <div key={k} className="flex items-center gap-4">
              <div className="shimmer h-4 w-28 rounded-md" />
              <div className="shimmer h-2.5 flex-1 rounded-full" style={{ maxWidth: `${w}%` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
