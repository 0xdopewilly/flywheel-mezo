"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    title: "Approve",
    tag: "One signature",
    body: "One approval lets Flywheel’s contract vote your veBTC. The NFT never moves, and Mezo keeps paying rewards to you.",
    Icon: KeyIcon,
  },
  {
    title: "Set limits",
    tag: "Enforced onchain",
    body: "Cap any single pool, ask for a minimum spread, split MUSD between boost and savings, set a weekly budget. The contract rejects anything outside them.",
    Icon: SlidersIcon,
  },
  {
    title: "It runs every epoch",
    tag: "Every Thursday",
    body: "The brain re-plans, votes, harvests and compounds, and publishes why, onchain, in the same transaction as the vote.",
    Icon: CycleIcon,
  },
];

export function HowItWorks() {
  return (
    <section className="shell mt-24 md:mt-32" aria-labelledby="how-title">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="display balance mt-2 text-[clamp(36px,4.8vw,62px)]">
            Three steps. <span className="energy-text">Then it keeps turning.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="pretty max-w-[440px] text-[16px] leading-[1.65] text-muted md:ml-auto">
            You set the rules once. Every Thursday the brain does the work inside them, and every boost it buys gives the next vote more weight.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-12 grid gap-5 md:mt-14 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.article
            key={s.title}
            className="hud group relative flex flex-col items-center px-6 pb-7 pt-9 text-center transition-transform duration-300 hover:-translate-y-1.5"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.12 }}
          >
            <p className="hud-num text-[12px] tracking-[0.24em] text-gold">Step 0{i + 1}</p>
            <div className="relative my-6 grid h-[96px] w-[96px] place-items-center">
              <span className="absolute inset-0 rounded-full bg-violet/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <s.Icon />
            </div>
            <h3 className="display text-[26px] tracking-[0.04em]">{s.title}</h3>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-violet-hi">{s.tag}</p>
            <p className="pretty mt-4 text-[14.5px] leading-[1.6] text-muted">{s.body}</p>
          </motion.article>
        ))}
        {/* connectors between the cards */}
        {["calc((100% - 40px) / 3 + 10px)", "calc((100% - 40px) * 2 / 3 + 30px)"].map((left) => (
          <span
            key={left}
            className="absolute top-1/2 z-10 hidden h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-violet-hi/70 bg-paper shadow-[0_0_14px_rgba(139,92,246,0.6)] md:block"
            style={{ left }}
            aria-hidden
          />
        ))}
      </div>

      <Reveal className="mt-8 flex justify-center">
        <Link href="/how" className="group inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">
          How the brain decides
          <span className="h-px w-10 bg-gold/70 transition-all group-hover:w-16" />
        </Link>
      </Reveal>
    </section>
  );
}

const stroke = { stroke: "#b69cff", strokeWidth: 1.6, fill: "none", strokeLinecap: "square" as const };

function KeyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="relative">
      <rect x="16" y="28" width="32" height="24" {...stroke} />
      <path d="M22 28v-7a10 10 0 0 1 19-4.5" {...stroke} />
      <circle cx="32" cy="38" r="3.4" {...stroke} />
      <path d="M32 41.5V46" {...stroke} />
      <path d="M8 40h4M52 40h4M30 8h4" stroke="#f5b53d" strokeWidth="1.6" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="relative">
      <path d="M12 18h40M12 32h40M12 46h40" {...stroke} strokeOpacity="0.45" />
      <rect x="20" y="14" width="8" height="8" {...stroke} />
      <rect x="38" y="28" width="8" height="8" {...stroke} />
      <rect x="26" y="42" width="8" height="8" {...stroke} />
      <path d="M12 18h8M12 32h26M12 46h14" stroke="#f5b53d" strokeWidth="1.8" />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="relative">
      <path d="M50 26a19 19 0 0 0-34.5-6M14 38a19 19 0 0 0 34.5 6" {...stroke} />
      <path d="M15 11v9h9M49 53v-9h-9" {...stroke} />
      <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" stroke="#f5b53d" strokeWidth="1.6" fill="none" />
    </svg>
  );
}
