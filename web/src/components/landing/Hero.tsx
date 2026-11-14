"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/site/Nav";

const Flywheel3D = dynamic(() => import("@/components/brand/Flywheel3D").then((m) => m.Flywheel3D), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const STATIONS = [
  { name: "Vote", line: "Splits your veBTC across Mezo Earn gauges, where each vote earns most once crowding is counted." },
  { name: "Harvest", line: "Claims incentives and fees every epoch. Mezo pays them straight to your wallet." },
  { name: "Boost", line: "Bids MUSD for veMEZO votes on your own boost gauge, only when the boost is worth it." },
  { name: "Save", line: "Parks the rest in the MUSD Savings Vault. The sMUSD lands in your wallet." },
];

export function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % STATIONS.length), 3600);
    return () => clearInterval(t);
  }, [paused]);
  const go = (d: number) => {
    setPaused(true);
    setI((v) => (v + d + STATIONS.length) % STATIONS.length);
  };
  const s = STATIONS[i];

  return (
    <section className="dark-island shell relative pt-2 md:pt-4" aria-labelledby="hero-title">
      <motion.div
        className="hud hud-lg glass relative overflow-hidden"
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE }}
      >
        {/* tabs on the frame, top and bottom */}
        <span className="absolute left-1/2 top-0 h-[7px] w-[140px] -translate-x-1/2 bg-violet/80 [clip-path:polygon(0_0,100%_0,88%_100%,12%_100%)]" aria-hidden />
        <span className="absolute bottom-0 left-1/2 h-[7px] w-[140px] -translate-x-1/2 bg-violet/80 [clip-path:polygon(12%_0,88%_0,100%_100%,0_100%)]" aria-hidden />

        <Wings />

        <div className="relative z-10 flex flex-col items-center px-5 pb-7 pt-9 text-center sm:px-10 md:pt-14">
          <motion.p className="eyebrow" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
            Mezo Earn · <span className="normal-case">ve</span>BTC autopilot
          </motion.p>
          <motion.h1
            id="hero-title"
            className="display mt-4 text-[clamp(42px,6.6vw,92px)] text-ink"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          >
            Your <span className="normal-case">ve</span>BTC, <span className="energy-text">on autopilot.</span>
          </motion.h1>
          <motion.p
            className="mt-3 font-[family-name:var(--font-display)] text-[clamp(14px,1.5vw,19px)] font-semibold uppercase tracking-[0.14em] text-violet-hi"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.35 }}
          >
            Votes · harvests · compounds, inside limits you set onchain
          </motion.p>

          {/* the object */}
          <div className="relative -my-4 w-full max-w-[640px]">
            <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.32),transparent_66%)]" aria-hidden />
            <Flywheel3D className="mx-auto aspect-square w-full max-w-[460px]" />
            <button type="button" onClick={() => go(-1)} aria-label="Previous station" className="absolute left-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper transition hover:scale-105 sm:grid md:-left-16">
              <Chevron dir={-1} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next station" className="absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper transition hover:scale-105 sm:grid md:-right-16">
              <Chevron dir={1} />
            </button>
          </div>

          {/* station caption */}
          <div className="relative h-[92px] w-full max-w-[520px]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="flex items-center justify-center gap-3">
                  <span className="hud-num text-[13px] tracking-[0.2em] text-gold">0{i + 1} / 04</span>
                  <span className="display text-[34px] leading-none tracking-[0.08em] text-ink">{s.name}</span>
                </p>
                <p className="pretty mx-auto mt-2 max-w-[460px] text-[14.5px] leading-relaxed text-muted">{s.line}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div className="mt-5 flex flex-wrap items-center justify-center gap-3" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}>
            <Link href="/app" className="btn btn-ink h-[52px] px-7">
              Launch app <Arrow />
            </Link>
            <a href="#plan" className="btn btn-ghost h-[52px] px-7">
              Watch it think
            </a>
          </motion.div>

          <div className="mt-8 flex w-full items-end justify-between gap-4 text-left">
            <Link href="/guide" className="group hidden items-center gap-3 text-[13px] text-ink/80 sm:flex">
              <span>New to veBTC? Start here</span>
              <span className="h-px w-8 bg-ink/60 transition-all group-hover:w-12" />
            </Link>
            <a href="#live" className="mx-auto text-ink/70 sm:mx-0" aria-label="Scroll to this epoch">
              <svg width="16" height="22" viewBox="0 0 16 22" fill="none" className="hud-pulse">
                <path d="M8 1v19m0 0 6-6m-6 6-6-6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
            <span className="hidden items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ok sm:flex">
              <span className="h-1.5 w-1.5 bg-ok shadow-[0_0_10px_#3ee0a1]" /> Live on Mezo testnet
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/** Angular wings, a tick ruler and dot blocks: the HUD around the object. */
function Wings() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      <svg className="absolute left-0 top-[18%] h-[62%] w-[34%]" viewBox="0 0 400 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wingL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2a1250" stopOpacity="0.2" />
            <stop offset="1" stopColor="#6d28d9" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <polygon points="0,90 250,40 400,250 250,460 0,410" fill="url(#wingL)" />
        <polyline points="120,70 250,40 400,250 250,460 120,430" fill="none" stroke="#b69cff" strokeOpacity="0.35" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="absolute right-0 top-[18%] h-[62%] w-[34%]" viewBox="0 0 400 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wingR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#2a1250" stopOpacity="0.2" />
            <stop offset="1" stopColor="#6d28d9" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <polygon points="400,90 150,40 0,250 150,460 400,410" fill="url(#wingR)" />
        <polyline points="280,70 150,40 0,250 150,460 280,430" fill="none" stroke="#b69cff" strokeOpacity="0.35" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* ruler */}
      <div className="absolute left-7 top-[36%] flex flex-col gap-[9px]">
        {Array.from({ length: 14 }).map((_, k) => (
          <span key={k} className={`h-px bg-ink/50 ${k % 5 === 0 ? "w-4" : "w-2"}`} />
        ))}
      </div>
      {/* dot blocks */}
      <div className="dots absolute right-7 top-[40%] h-[64px] w-[22px] opacity-70" />
      <div className="dots absolute right-7 top-[54%] h-[44px] w-[22px] opacity-40" />
      {/* corner brackets */}
      <span className="absolute left-4 top-4 h-4 w-4 border-l border-t border-violet-hi/60" />
      <span className="absolute right-4 top-4 h-4 w-4 border-r border-t border-violet-hi/60" />
      <span className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-violet-hi/60" />
      <span className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-violet-hi/60" />
    </div>
  );
}

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M3 8h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Check({ className = "text-ok" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M8 1 14 4.5v7L8 15 2 11.5v-7z" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="m5 8.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}
