"use client";

import { useNow } from "@/lib/ui/hooks";
import { pad2, splitCountdown } from "@/lib/ui/format";

/** Live countdown to a unix time, in tabular figures: 2d 14h 03m 12s. */
export function Countdown({ to, className = "", seconds = true }: { to: number; className?: string; seconds?: boolean }) {
  const now = useNow(1000);
  const left = now === null ? null : Math.max(0, to - now);
  if (left === null) return <span className={`tnum ${className}`}>&nbsp;</span>;
  if (left === 0) return <span className={className}>closed</span>;
  const { d, h, m, s } = splitCountdown(left);
  const unit = "ml-[0.12em] mr-[0.42em] text-[0.55em] font-medium opacity-50";
  return (
    <span className={`tnum whitespace-nowrap ${className}`} aria-label={`${d} days ${h} hours ${m} minutes`}>
      {d > 0 && (
        <>
          {d}
          <span className={unit}>d</span>
        </>
      )}
      {pad2(h)}
      <span className={unit}>h</span>
      {pad2(m)}
      <span className={unit}>m</span>
      {seconds && (
        <>
          {pad2(s)}
          <span className={`${unit} mr-0`}>s</span>
        </>
      )}
    </span>
  );
}
