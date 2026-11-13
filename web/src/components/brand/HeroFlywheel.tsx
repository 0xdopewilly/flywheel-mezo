"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import { STATION_ICONS } from "./StationIcons";

const STATIONS = [
  { name: "Vote", line: "Your veBTC votes where rewards per vote beat the crowd." },
  { name: "Earn", line: "Fees and incentives land in your wallet, paid by Mezo." },
  { name: "Boost", line: "MUSD bids for veMEZO votes that multiply your power, up to 5×." },
  { name: "Save", line: "The rest earns in the MUSD Savings Vault, sent to you as sMUSD." },
];

// Geometry in a 600-unit square.
const C = 300;
const R = 228; // track centre line
const BAND = 16;
const EASE = [0.16, 1, 0.3, 1] as const;

const rad = (clockDeg: number) => ((clockDeg - 90) * Math.PI) / 180;
const r2 = (v: number) => Math.round(v * 100) / 100;
const at = (clockDeg: number, r = R) => [r2(C + r * Math.cos(rad(clockDeg))), r2(C + r * Math.sin(rad(clockDeg)))] as const;

const lerpColor = (t: number) => {
  // #B69CFF -> #6D28D9
  const a = [255, 0, 77];
  const b = [107, 0, 54];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
};

const BAND_PARTICLES = [0, 38, 77, 118, 160, 199, 241, 283, 322].map((deg, i) => ({
  deg,
  r: R + [-4, 3, -1, 5, -5, 2, -3, 4, 0][i],
  size: [3.4, 2.4, 3, 2.2, 3.6, 2.6, 2.2, 3.2, 2.6][i],
  color: lerpColor(i / 8),
}));

const BASE_SPEED = 30; // degrees per second: one lap in 12 s

/**
 * The signature: a flywheel with four stations and red-to-plum energy travelling around it.
 * It spins up on load, gains a little momentum every lap, and runs faster on hover or scroll.
 */
export function HeroFlywheel({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { margin: "120px" });
  const reduce = useReducedMotion();
  const angle = useMotionValue(reduce ? 24 : -26);
  const fast = useTransform(angle, (a) => a * 1.55);
  const slowRev = useTransform(angle, (a) => -a * 0.32);
  const speed = useRef(0);
  const hot = useRef(false);
  const { scrollY } = useScroll();
  const scrollVel = useVelocity(scrollY);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!inView || reduce) return;
    const dt = Math.min(delta, 64) / 1000;
    const laps = Math.max(0, angle.get()) / 360;
    const momentum = 1 + Math.min(0.45, laps * 0.06);
    const target = BASE_SPEED * momentum * (hot.current ? 2.6 : 1) + Math.min(240, Math.abs(scrollVel.get()) * 0.14);
    speed.current += (target - speed.current) * (1 - Math.exp(-dt * 2.4));
    angle.set(angle.get() + speed.current * dt);
  });

  useMotionValueEvent(angle, "change", (a) => {
    const norm = ((a % 360) + 360) % 360;
    const idx = Math.floor(((norm + 4) % 360) / 90);
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
  });

  const pulse = (ms: number) => {
    hot.current = true;
    window.setTimeout(() => (hot.current = false), ms);
  };

  return (
    <motion.div
      ref={wrap}
      className={`relative aspect-square w-full select-none [container-type:inline-size] ${className}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: EASE }}
      onPointerEnter={(e) => e.pointerType === "mouse" && (hot.current = true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && (hot.current = false)}
      onPointerDown={(e) => e.pointerType !== "mouse" && pulse(1600)}
      role="img"
      aria-label="The Flywheel loop: Vote, Earn, Boost, Save, and back to Vote with more voting power."
    >
      {/* 1. static: bezel ticks, track, direction marks */}
      <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="fw-face" cx="50%" cy="46%" r="55%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={290} fill="url(#fw-face)" />
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.2 }}>
          {Array.from({ length: 52 }, (_, i) => {
            if (i % 13 === 0) return null;
            const deg = (i * 360) / 52;
            const major = i % 13 === 6 || i % 13 === 7;
            const [x1, y1] = at(deg, 255);
            const [x2, y2] = at(deg, major ? 266 : 262);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F1ECFF" strokeOpacity={major ? 0.28 : 0.14} strokeWidth={1.4} strokeLinecap="round" />;
          })}
        </motion.g>
        <motion.circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="#F1ECFF"
          strokeOpacity={0.07}
          strokeWidth={BAND}
          transform={`rotate(-90 ${C} ${C})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.1 }}
        />
      </svg>

      {/* 2. inner dotted ring, slowly counter-rotating */}
      <motion.div className="absolute inset-0" style={{ rotate: slowRev }} aria-hidden>
        <svg viewBox="0 0 600 600" className="h-full w-full">
          <circle cx={C} cy={C} r={186} fill="none" stroke="#F1ECFF" strokeOpacity={0.16} strokeWidth={2} strokeDasharray="0.1 9.6" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* 3. the energy comet: a conic gradient masked to the band, plus its bead */}
      <motion.div className="absolute inset-0" style={{ rotate: angle }} aria-hidden>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(109,40,217,0) 0deg, rgba(109,40,217,0) 190deg, rgba(109,40,217,0.28) 260deg, rgba(139,92,246,0.7) 318deg, #a78bfa 348deg, #B69CFF 360deg)",
            WebkitMaskImage: `radial-gradient(circle closest-side, transparent ${((R - BAND / 2) / 3).toFixed(3)}%, #000 ${((R - BAND / 2) / 3 + 0.25).toFixed(3)}%, #000 ${((R + BAND / 2) / 3 - 0.25).toFixed(3)}%, transparent ${((R + BAND / 2) / 3).toFixed(3)}%)`,
            maskImage: `radial-gradient(circle closest-side, transparent ${((R - BAND / 2) / 3).toFixed(3)}%, #000 ${((R - BAND / 2) / 3 + 0.25).toFixed(3)}%, #000 ${((R + BAND / 2) / 3 - 0.25).toFixed(3)}%, transparent ${((R + BAND / 2) / 3).toFixed(3)}%)`,
          }}
        />
        <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full">
          <circle cx={C} cy={C - R} r={12.5} fill="#B69CFF" stroke="#07040D" strokeWidth={3} />
          <circle cx={C} cy={C - R} r={4.2} fill="#fff" />
        </svg>
      </motion.div>

      {/* 4. particles streaming faster than the comet */}
      <motion.div className="absolute inset-0" style={{ rotate: fast }} aria-hidden>
        <svg viewBox="0 0 600 600" className="h-full w-full">
          {BAND_PARTICLES.map((p, i) => (
            <g key={i}>
              {[0, -1.7, -3.4].map((off, k) => {
                const [x, y] = at(p.deg + off, p.r);
                return <circle key={k} cx={x} cy={y} r={p.size * (1 - k * 0.28)} fill={p.color} fillOpacity={1 - k * 0.38} />;
              })}
            </g>
          ))}
        </svg>
      </motion.div>

      {/* 5. stations */}
      {STATIONS.map((s, i) => (
        <Station key={s.name} index={i} name={s.name} angle={angle} active={active === i} />
      ))}

      {/* 6. hub */}
      <div className="absolute left-1/2 top-1/2 flex aspect-square w-[52%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.04)]">
        <div className="relative flex h-[62%] w-[74%] flex-col items-center justify-center text-center">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.28, ease: EASE } }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
            >
              <span className="serif-accent energy-text leading-none" style={{ fontSize: "clamp(34px, 11cqw, 66px)" }}>
                {STATIONS[active].name}
              </span>
              <span className="pretty mt-[2.2cqw] text-muted" style={{ fontSize: "clamp(11.5px, 2.75cqw, 16px)", lineHeight: 1.38 }}>
                {STATIONS[active].line}
              </span>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0 flex gap-1.5" aria-hidden>
            {STATIONS.map((_, i) => (
              <span
                key={i}
                className="h-[3px] rounded-full transition-all duration-500"
                style={{ width: i === active ? 18 : 6, background: i === active ? "#F1ECFF" : "rgba(241,236,255,0.15)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Station({ index, name, angle, active }: { index: number; name: string; angle: MotionValue<number>; active: boolean }) {
  const s = index * 90;
  // 0 far away, rising as the comet approaches, 1 as it arrives, fading as it leaves
  const glow = useTransform(angle, (a) => {
    const d = (((a - s) % 360) + 360) % 360;
    if (d < 80) return 1 - d / 80;
    if (d > 336) return (d - 336) / 24;
    return 0;
  });
  const scale = useTransform(glow, (g) => 1 + g * 0.07);
  const Icon = STATION_ICONS[index];
  const [x, y] = at(s);
  return (
    <motion.div
      className="absolute"
      style={{ left: `${(x / 6).toFixed(3)}%`, top: `${(y / 6).toFixed(3)}%`, x: "-50%", y: "-50%", scale }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.55 + index * 0.09 }}
    >
      <div
        className="relative flex items-center rounded-full bg-white font-semibold tracking-[-0.01em] text-ink shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_28px_-12px_rgba(0,0,0,0.35)]"
        style={{ fontSize: "clamp(12.5px, 2.6cqw, 15.5px)", height: "clamp(34px, 7.6cqw, 46px)", padding: "0 clamp(12px, 2.6cqw, 17px) 0 clamp(10px, 2.2cqw, 14px)", gap: "clamp(6px, 1.3cqw, 9px)" }}
      >
        <span className="relative grid place-items-center">
          <Icon size={18} className="text-ink" />
          <motion.span className="absolute inset-0 grid place-items-center text-red" style={{ opacity: glow }}>
            <Icon size={18} />
          </motion.span>
        </span>
        <span>{name}</span>
        <motion.span className="pointer-events-none absolute inset-0 rounded-full ring-[1.5px] ring-red" style={{ opacity: glow }} />
        <span className="sr-only">{active ? "(now)" : ""}</span>
      </div>
    </motion.div>
  );
}
