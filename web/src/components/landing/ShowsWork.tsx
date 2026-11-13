"use client";

import Link from "next/link";
import { api } from "@/lib/ui/api";
import { useCachedQuery } from "@/lib/ui/hooks";
import { DEFAULT_UI_POLICY, DEMO_TOKEN_ID } from "@/lib/ui/types";
import { PlanCard } from "@/components/plan/PlanCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Arrow } from "@/components/site/Nav";

const POINTS = [
  { t: "It shows the numbers", d: "Rewards per vote, how crowded each gauge is, and what simpler strategies would earn." },
  { t: "It explains in plain words", d: "Claude writes the why from the plan’s own numbers. A guard rejects any figure the plan doesn’t contain." },
  { t: "It publishes before it acts", d: "The full plan goes on-chain with the vote, so anyone can check that what ran is what it said." },
];

export function ShowsWork() {
  const q = useCachedQuery(["plan", DEMO_TOKEN_ID, "landing"], () => api.plan(DEMO_TOKEN_ID, DEFAULT_UI_POLICY, 0));
  return (
    <section id="plan" className="shell mt-28 scroll-mt-24 md:mt-40" aria-labelledby="work-title">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h2 id="work-title" className="display balance text-[clamp(38px,5vw,64px)]">
              It shows its work, <span className="serif-accent energy-text">on-chain.</span>
            </h2>
            <p className="pretty mt-6 max-w-[460px] text-[17px] leading-[1.6] text-ink/70">
              This is the brain’s live plan for a real veBTC on Mezo testnet, #{DEMO_TOKEN_ID}, computed from this epoch’s gauges. Every vote it
              casts carries a plan like this one.
            </p>
          </Reveal>
          <Stagger className="mt-10 flex flex-col gap-6" gap={0.1}>
            {POINTS.map((p, i) => (
              <StaggerItem key={p.t} className="flex gap-4">
                <span className="serif-accent mt-[-2px] w-5 shrink-0 text-[24px] leading-none text-red">{i + 1}</span>
                <div>
                  <p className="text-[16px] font-semibold tracking-[-0.01em]">{p.t}</p>
                  <p className="mt-1 max-w-[420px] text-[15px] leading-relaxed text-muted">{p.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.2}>
            <Link href="/app" className="link-underline mt-10 inline-flex items-center gap-2 text-[15px] font-semibold">
              Change the limits and watch it re-plan <Arrow />
            </Link>
          </Reveal>
        </div>
        <Reveal y={40}>
          <PlanCard tokenId={DEMO_TOKEN_ID} data={q.data} error={q.data ? undefined : q.error} isFetching={q.isFetching && !!q.data} onRetry={() => q.refetch()} variant="landing" />
        </Reveal>
      </div>
    </section>
  );
}
