"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroFlywheel } from "@/components/brand/HeroFlywheel";
import { Arrow } from "@/components/site/Nav";

const EASE = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="-mb-[0.16em] block overflow-hidden pb-[0.16em] pr-[0.1em]">
      <motion.span className="block" initial={{ y: "108%" }} animate={{ y: "0%" }} transition={{ duration: 1.05, ease: EASE, delay }}>
        {children}
      </motion.span>
    </span>
  );
}

const FACTS = ["Your veBTC never leaves your wallet", "Mezo pays rewards straight to you", "Exit in one transaction"];

export function Hero() {
  return (
    <section className="shell relative grid items-center gap-6 pb-10 pt-6 md:pt-10 lg:min-h-[min(820px,calc(100svh-140px))] lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-16 lg:pt-0">
      <div className="relative z-10 max-w-[640px]">
        <motion.p
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13.5px] font-medium text-ink/80 shadow-[0_1px_0_rgba(23,23,23,0.04)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="serif-accent text-[16px] leading-none text-red">for</span> Mezo veBTC holders
        </motion.p>
        <h1 className="display text-[clamp(50px,6.7vw,94px)]">
          <Line delay={0.05}>Your veBTC,</Line>
          <Line delay={0.16}>
            on <span className="serif-accent energy-text text-[1.12em] leading-[0.8]">autopilot.</span>
          </Line>
        </h1>
        <motion.p
          className="pretty mt-6 max-w-[540px] text-[17px] sm:mt-7 leading-[1.55] text-ink/70 md:text-[19px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.38 }}
        >
          Flywheel’s brain votes, harvests and compounds your veBTC every epoch, within limits you set, and publishes its reasoning on-chain before it
          touches anything.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center gap-2.5 sm:mt-9 sm:gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          <Link href="/app" className="btn btn-ink h-[50px] px-5 text-[15px] sm:h-[52px] sm:px-6 sm:text-[16px]">
            Open the app
            <Arrow />
          </Link>
          <a href="#plan" className="btn btn-ghost h-[50px] px-5 text-[15px] sm:h-[52px] sm:px-6 sm:text-[16px]">
            <span className="sm:hidden">This week’s plan</span>
            <span className="hidden sm:inline">Read this week’s plan</span>
          </a>
        </motion.div>
        <motion.ul
          className="mt-10 hidden flex-wrap gap-x-6 gap-y-2.5 text-[14px] text-muted sm:flex"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.7 } } }}
        >
          {FACTS.map((f) => (
            <motion.li
              key={f}
              className="flex items-center gap-2"
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
            >
              <Check />
              {f}
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <div className="relative mx-auto mt-4 w-full max-w-[420px] sm:max-w-[520px] lg:mt-0 lg:max-w-[620px]">
        <HeroFlywheel />
      </div>
    </section>
  );
}

export function Check({ className = "text-ink" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <path d="m5 8.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
