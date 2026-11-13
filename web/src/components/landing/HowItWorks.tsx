"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FlywheelMark } from "@/components/brand/FlywheelMark";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: "1",
    title: "Approve",
    body: "One approval lets Flywheel’s contract vote your veBTC. The NFT never moves, and Mezo keeps paying rewards to you.",
    tint: "bg-sand",
    Art: ApproveArt,
  },
  {
    n: "2",
    title: "Set limits",
    body: "Cap any single pool, ask for a minimum spread, split MUSD between boost and savings, and set a weekly budget. The contract enforces every one.",
    tint: "bg-lime",
    Art: LimitsArt,
  },
  {
    n: "3",
    title: "It runs every epoch",
    body: "Each Thursday the brain re-plans, votes, harvests and compounds, and publishes why, on-chain, with the vote.",
    tint: "bg-blush",
    Art: EpochArt,
  },
];

export function HowItWorks() {
  return (
    <section className="shell mt-28 md:mt-40" aria-labelledby="how-title">
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
        <Reveal>
          <h2 id="how-title" className="display balance text-[clamp(38px,5vw,64px)]">
            Three steps, then it <span className="serif-accent">keeps turning.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="pretty max-w-[420px] text-[17px] leading-[1.6] text-ink/70 md:ml-auto">
            You set the rules once. Every Thursday the brain does the work inside them, and each epoch the boost it buys gives the next vote more
            weight.
          </p>
        </Reveal>
      </div>
      <Stagger className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5" gap={0.12}>
        {STEPS.map((s) => (
          <StaggerItem key={s.n} as="article" className={`${s.tint} flex flex-col rounded-[32px] p-3`}>
            <div className="relative h-[210px] overflow-hidden rounded-[24px] bg-white/55">
              <s.Art />
            </div>
            <div className="px-4 pb-5 pt-6 sm:px-5">
              <div className="flex items-baseline gap-3">
                <span className="serif-accent text-[34px] leading-none text-ink/40">{s.n}</span>
                <h3 className="text-[22px] font-semibold tracking-[-0.025em]">{s.title}</h3>
              </div>
              <p className="pretty mt-3 text-[15.5px] leading-[1.55] text-ink/70">{s.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function useSeen() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return [ref, seen] as const;
}

function ApproveArt() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="absolute inset-0 grid place-items-center">
      <motion.div
        className="relative w-[200px] rounded-[20px] bg-white p-4 shadow-[0_20px_40px_-24px_rgba(23,23,23,0.35)]"
        initial={{ rotate: -6, y: 10 }}
        animate={seen ? { rotate: -3, y: 0 } : {}}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">veBTC</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="3" y="7" width="10" height="7" rx="2" stroke="#171717" strokeWidth="1.4" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="#171717" strokeWidth="1.4" />
          </svg>
        </div>
        <div className="mt-4 h-2 w-[70%] rounded-full bg-ink/10" />
        <div className="mt-2 h-2 w-[45%] rounded-full bg-ink/10" />
        <p className="mt-4 text-[11.5px] text-muted">Stays in your wallet</p>
      </motion.div>
      <motion.div
        className="absolute bottom-6 flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[12.5px] font-medium text-white shadow-[0_12px_30px_-12px_rgba(23,23,23,0.6)]"
        initial={{ opacity: 0, y: 14, scale: 0.94 }}
        animate={seen ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="7" fill="#FF004D" />
          <motion.path
            d="m4.8 8.2 2.1 2.1 4.3-4.6"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={seen ? { pathLength: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
        </svg>
        Flywheel may vote this veBTC
      </motion.div>
    </div>
  );
}

function LimitsArt() {
  const [ref, seen] = useSeen();
  const rows = [
    { label: "Most in one pool", to: 0.55 },
    { label: "Boost share", to: 0.3 },
    { label: "Weekly budget", to: 0.72 },
  ];
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-center gap-5 px-7">
      {rows.map((r, i) => (
        <div key={r.label}>
          <p className="mb-2 text-[12.5px] font-medium text-ink/70">{r.label}</p>
          <div className="relative h-[5px] rounded-full bg-ink/10">
            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-ink"
              initial={{ scaleX: 0 }}
              animate={seen ? { scaleX: r.to } : {}}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.14 }}
            />
            <motion.div
              className="absolute inset-0"
              initial={{ x: "0%" }}
              animate={seen ? { x: `${r.to * 100}%` } : {}}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.14 }}
            >
              <div className="absolute left-0 top-1/2 -ml-[9px] h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_rgba(23,23,23,0.12),0_4px_10px_-2px_rgba(23,23,23,0.3)]" />
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EpochArt() {
  const [ref, seen] = useSeen();
  const items = ["Vote across gauges", "Harvest rewards", "Compound MUSD", "Publish the plan on-chain"];
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-center px-7">
      <div className="mb-3 flex items-center gap-2.5">
        <FlywheelMark size={22} spinning={seen} className="text-ink" />
        <p className="text-[13px] font-semibold">Thursday, 00:00 UTC</p>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((t, i) => (
          <motion.li
            key={t}
            className="flex items-center gap-2.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={seen ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.32 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="6" fill={i === items.length - 1 ? "#FF004D" : "#171717"} />
              <path d="m4.3 7.1 1.8 1.8 3.6-3.9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
