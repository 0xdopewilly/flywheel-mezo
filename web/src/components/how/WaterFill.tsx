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
const CUT = 12;
const y = (v: number) => BOTTOM - v * (BOTTOM - TOP);
// a vessel with the HUD's two cut corners (top-left, bottom-right)
const vessel = (x: number) => `M ${x + CUT} ${TOP} H ${x + COL} V ${BOTTOM - CUT} L ${x + COL - CUT} ${BOTTOM} H ${x} V ${TOP + CUT} Z`;

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
            <stop offset="0" stopColor="#D6C6FF" />
            <stop offset="0.35" stopColor="#B69CFF" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="wf-vessel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#150C26" />
            <stop offset="1" stopColor="#0B0614" />
          </linearGradient>
          {/* dot matrix for the crowd already voting */}
          <pattern id="wf-dots" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="1" fill="#B69CFF" fillOpacity="0.4" />
          </pattern>
          {/* segment gaps that turn each column into a HUD meter */}
          <pattern id="wf-seg" width={COL} height="8" patternUnits="userSpaceOnUse" y={TOP}>
            <rect x="0" y="6" width={COL} height="2" fill="#07040D" fillOpacity="0.75" />
          </pattern>
        </defs>
        {FLOORS.map((f, i) => {
          const x = GAP + i * (COL + GAP);
          return (
            <g key={i}>
              <clipPath id={`wf-clip-${i}`}>
                <path d={vessel(x)} />
              </clipPath>
              {/* the vessel */}
              <path d={vessel(x)} fill="url(#wf-vessel)" />
              <g clipPath={`url(#wf-clip-${i})`}>
                {/* the floor: how crowded the gauge already is */}
                <rect x={x} y={y(f)} width={COL} height={BOTTOM - y(f)} fill="#8B5CF6" fillOpacity={0.12} />
                <rect x={x} y={y(f)} width={COL} height={BOTTOM - y(f)} fill="url(#wf-dots)" />
                <line x1={x} x2={x + COL} y1={y(f)} y2={y(f)} stroke="#B69CFF" strokeOpacity={0.45} strokeWidth={1} />
                <Water x={x} floor={f} level={level} />
                <rect x={x} y={TOP} width={COL} height={BOTTOM - TOP} fill="url(#wf-seg)" />
              </g>
              <path d={vessel(x)} fill="none" stroke="#B69CFF" strokeOpacity={0.4} strokeWidth={1} />
              <text
                x={x + COL / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                letterSpacing="2.2"
                fill="#D9D0F2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                GAUGE {"ABCD"[i]}
              </text>
            </g>
          );
        })}
        <motion.g style={{ y: lineY }}>
          <line x1={GAP - 10} x2={W - GAP + 10} y1={y(0)} y2={y(0)} stroke="#F5B53D" strokeWidth={1.6} strokeDasharray="5 5" />
          <path d={`M ${GAP - 18} ${y(0) - 5} L ${GAP - 10} ${y(0)} L ${GAP - 18} ${y(0) + 5} Z`} fill="#F5B53D" />
        </motion.g>
      </svg>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="dots h-3 w-3 shrink-0 bg-violet/15 [background-size:4px_4px]" /> Crowding: votes already there for each dollar of rewards
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 shrink-0" style={{ background: "linear-gradient(#D6C6FF,#6D28D9)" }} /> Your votes
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 shrink-0 border-t-[1.5px] border-dashed border-gold" /> Same reward for the next vote everywhere
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
