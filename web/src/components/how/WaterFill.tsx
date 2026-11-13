"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

// Illustrative only: four gauges with different crowding. The level is where pouring stops.
const FLOORS = [0.2, 0.38, 0.54, 0.8];
const LEVEL = 0.66;
const W = 560;
const H = 300;
const COL = 96;
const GAP = (W - COL * 4) / 5;
const TOP = 24;
const BOTTOM = H - 36;
const y = (v: number) => BOTTOM - v * (BOTTOM - TOP);

export function WaterFill() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  const level = useMotionValue(reduce ? LEVEL : 0);
  useEffect(() => {
    if (!seen || reduce) return;
    const c = animate(level, LEVEL, { duration: 2.8, ease: [0.33, 0, 0.2, 1], delay: 0.3 });
    return () => c.stop();
  }, [seen, reduce, level]);
  const lineY = useTransform(level, (l) => y(l) - y(0));

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Illustration of water-filling: votes fill the least crowded gauges first, up to one common level.">
        <defs>
          <linearGradient id="wf-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF004D" />
            <stop offset="1" stopColor="#6B0036" />
          </linearGradient>
        </defs>
        {FLOORS.map((f, i) => {
          const x = GAP + i * (COL + GAP);
          return (
            <g key={i}>
              <clipPath id={`wf-clip-${i}`}>
                <rect x={x} y={TOP} width={COL} height={BOTTOM - TOP} rx={16} />
              </clipPath>
              {/* the vessel */}
              <rect x={x} y={TOP} width={COL} height={BOTTOM - TOP} rx={16} fill="#fff" />
              <g clipPath={`url(#wf-clip-${i})`}>
                {/* the floor: how crowded the gauge already is */}
                <rect x={x} y={y(f)} width={COL} height={BOTTOM - y(f)} fill="#171717" fillOpacity={0.08} />
                <Water x={x} floor={f} level={level} />
              </g>
              <text x={x + COL / 2} y={H - 8} textAnchor="middle" fontSize="17" fontWeight="600" fill="#171717">
                Gauge {"ABCD"[i]}
              </text>
            </g>
          );
        })}
        <motion.g style={{ y: lineY }}>
          <line x1={GAP - 8} x2={W - GAP + 8} y1={y(0)} y2={y(0)} stroke="#171717" strokeWidth={1.4} strokeDasharray="4 5" />
        </motion.g>
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-[4px] bg-ink/10" /> Crowding: votes already there for each dollar of rewards
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-[4px]" style={{ background: "linear-gradient(#FF004D,#6B0036)" }} /> Your votes
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 border-t-[1.5px] border-dashed border-ink" /> Same reward for the next vote everywhere
        </span>
      </div>
    </div>
  );
}

function Water({ x, floor, level }: { x: number; floor: number; level: MotionValue<number> }) {
  const full = y(floor) - TOP;
  const scaleY = useTransform(level, (l) => Math.max(0, Math.min(1, (l - floor) / (1 - floor))));
  return (
    <motion.rect
      x={x}
      y={TOP}
      width={COL}
      height={full}
      fill="url(#wf-water)"
      style={{ scaleY, originY: 1, transformBox: "fill-box" }}
    />
  );
}
