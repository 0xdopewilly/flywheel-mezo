import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Nav, Arrow, ExternalArrow } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { WaterFill } from "@/components/how/WaterFill";
import { BoostLive } from "@/components/how/BoostLive";
import { MEZO, PILOT_ADDRESS, addrUrl } from "@/lib/mezo/chain";

export const metadata: Metadata = {
  title: "How it works",
  description: "The maths behind Flywheel in plain words: rewards per vote against crowding, the boost formula, and the limits the contract enforces.",
};

const GUARDS = [
  { t: "No pool above your cap", d: "A vote that gives any pool more than your per-pool share reverts.", e: "PoolShareTooHigh" },
  { t: "Never fewer pools than your minimum", d: "A plan that spreads over fewer gauges than you asked for reverts.", e: "TooFewPools" },
  { t: "Only live Mezo gauges", d: "Dead gauges, unknown pools and any pool you blocked are refused.", e: "PoolNotAllowed" },
  { t: "A weekly MUSD budget", d: "The brain can pull at most your budget from your wallet each epoch, and only toward you.", e: "OverEpochCap" },
  { t: "Boost within your share", d: "No more of a reinvestment goes to boost than you allowed. With savings off, nothing is deposited.", e: "BoostShareTooHigh" },
  { t: "Rewards go to the owner", d: "Harvesting claims through Mezo, which pays the NFT’s owner. Savings deposits send the sMUSD to you." },
  { t: "It stops if the veBTC moves", d: "Sell or transfer the veBTC and the autopilot stops acting for it.", e: "OwnerChanged" },
  { t: "A fee with a hard ceiling", d: "Flywheel’s fee applies only to MUSD it reinvests, and the contract caps it at 10%.", e: "MAX_FEE_BPS" },
];

const CONTRACTS: { name: string; what: string; addr: string }[] = [
  { name: "veBTC", what: "The locked-BTC NFT Flywheel votes with", addr: MEZO.veBTC },
  { name: "Pools voter", what: "Takes veBTC votes across Mezo Earn gauges", addr: MEZO.poolsVoter },
  { name: "Boost voter", what: "Where veMEZO votes boost a veBTC", addr: MEZO.boostVoter },
  { name: "Boost gauge factory", what: "Creates a veBTC’s own boost gauge", addr: MEZO.boostGaugeFactory },
  { name: "veMEZO", what: "Locked MEZO, the votes that boost buys", addr: MEZO.veMEZO },
  { name: "MUSD", what: "Mezo’s BTC-backed dollar", addr: MEZO.musd },
  { name: "MUSD Savings Vault", what: "Where saved MUSD earns, as sMUSD", addr: MEZO.smusd },
];

const SECTIONS = [
  { id: "votes", t: "Rewards per vote" },
  { id: "boost", t: "Boost" },
  { id: "guards", t: "Contract limits" },
  { id: "contracts", t: "Mezo contracts" },
];

/** Keeps Mezo's lowercase prefixes (veBTC, veMEZO, sMUSD) intact inside uppercase display type. */
function caps(text: string): ReactNode {
  return text.split(/\b(ve[A-Z]+|sMUSD)\b/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="normal-case">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function SectionTag({ n, label }: { n: number; label: string }) {
  return (
    <p className="flex items-center gap-3">
      <span className="hud-num text-[15px] tracking-[0.18em] text-gold">0{n}</span>
      <span className="hud-num text-[13px] tracking-[0.18em] text-faint">/ 0{SECTIONS.length}</span>
      <span className="h-px w-10 bg-line-strong" aria-hidden />
      <span className="eyebrow">{label}</span>
    </p>
  );
}

const op = "px-[0.15em] font-sans font-normal text-[0.85em] text-faint";

export default function HowPage() {
  const contracts = PILOT_ADDRESS ? [{ name: "FlywheelPilot", what: "Flywheel’s contract: the guardrails above", addr: PILOT_ADDRESS }, ...CONTRACTS] : CONTRACTS;
  return (
    <>
      <Nav />
      <main className="shell">
        <header className="grid gap-10 pb-6 pt-10 md:pt-20 lg:grid-cols-[1fr_340px] lg:items-end lg:gap-16">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h1 className="display balance mt-4 max-w-[900px] text-[clamp(50px,8vw,112px)]">
              How the brain <span className="energy-text">thinks.</span>
            </h1>
            <p className="pretty mt-7 max-w-[620px] text-[18px] leading-[1.6] text-ink/70">
              Each epoch Flywheel votes, harvests and reinvests. Here is the maths behind each decision in plain words, and the rules the contract
              holds it to.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="hidden lg:block">
            <nav className="hud glass px-6 py-5" aria-label="On this page">
              <ol className="divide-y divide-line">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="group flex items-center gap-4 py-3 transition-colors">
                      <span className="hud-num text-[13px] tracking-[0.18em] text-gold">0{i + 1}</span>
                      <span className="flex-1 font-[family-name:var(--font-display)] text-[16px] font-semibold uppercase tracking-[0.1em] text-ink/80 transition-colors group-hover:text-ink">
                        {s.t}
                      </span>
                      <span className="h-px w-5 bg-violet-hi/50 transition-all duration-300 group-hover:w-9 group-hover:bg-violet-hi" aria-hidden />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        </header>

        {/* 1. votes */}
        <section className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-16" aria-labelledby="votes">
          <Reveal>
            <SectionTag n={1} label="Votes" />
            <h2 id="votes" className="display balance mt-5 scroll-mt-[150px] text-[clamp(36px,4.4vw,58px)]">
              Rewards per vote, <span className="energy-text">minus the crowd.</span>
            </h2>
            <div className="pretty mt-6 flex max-w-[540px] flex-col gap-4 text-[16.5px] leading-[1.65] text-ink/70">
              <p>
                Every Mezo Earn gauge has a pot for the epoch: the incentives people posted plus the trading fees. The pot is split between everyone
                who voted for it, in proportion to their votes.
              </p>
              <p>
                So the size of the pot is not what matters. What matters is how much the <em className="font-semibold not-italic text-violet-hi">next</em> vote
                earns once your own votes join the crowd, because each vote you add also dilutes the ones before it.
              </p>
              <p>
                The brain pours your votes, a little at a time, into whichever gauge pays most for the next one, the way water finds the lowest point
                first. It stops when every gauge it uses pays the same for one more vote. Then your limits apply: no gauge above your cap, and at
                least your minimum number of gauges.
              </p>
            </div>
          </Reveal>
          <Reveal y={40} className="self-center">
            <div className="hud hud-lg p-5 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="eyebrow">Water-filling</p>
                <p className="font-[family-name:var(--font-display)] text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">illustration</p>
              </div>
              <WaterFill />
            </div>
            <div className="hud mt-4 px-6 py-5 sm:px-7">
              <p className="eyebrow !text-[12px]">Your share of a gauge’s pot</p>
              <p className="display mt-3 text-[19px] !leading-[1.4] tracking-[0.03em] sm:text-[24px]">
                pot <span className={op}>×</span> <span className="text-violet-hi">your votes</span> <span className={op}>÷</span>{" "}
                <span className="whitespace-nowrap">
                  ( <span className="text-ink-2">everyone else’s</span> <span className={op}>+</span> <span className="text-violet-hi">yours</span> )
                </span>
              </p>
            </div>
          </Reveal>
        </section>

        {/* 2. boost */}
        <section className="mt-28 md:mt-40" aria-labelledby="boost">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <Reveal>
              <SectionTag n={2} label="Boost" />
              <h2 id="boost" className="display balance mt-5 scroll-mt-[150px] text-[clamp(36px,4.4vw,58px)]">
                Boost: buying votes <span className="energy-text">that multiply yours.</span>
              </h2>
              <div className="pretty mt-6 flex max-w-[540px] flex-col gap-4 text-[16.5px] leading-[1.65] text-ink/70">
                <p>
                  Every veBTC has its own boost gauge. veMEZO holders who vote on it raise that veBTC’s voting power, up to five times. A small veBTC
                  gets far more lift from each veMEZO vote than a big one.
                </p>
                <p>
                  Flywheel can post part of your MUSD as incentives on your boost gauge to attract those votes. It only spends when the extra rewards
                  from the higher boost beat the cost, at the price veMEZO voters are being paid.
                </p>
                <p>
                  When nobody is paying veMEZO voters, there is no price to follow. Then it bids half of what the extra boost is worth to you:
                  whoever takes the bid is paid, and you keep the other half.
                </p>
              </div>
            </Reveal>
            <Reveal y={40} className="self-center">
              <div className="hud hud-lg overflow-hidden p-6 sm:p-9">
                <div className="dots pointer-events-none absolute right-6 top-6 h-14 w-28 opacity-50 [mask-image:linear-gradient(90deg,transparent,#000)]" aria-hidden />
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.3),transparent_68%)]"
                  aria-hidden
                />
                <p className="eyebrow relative">Mezo’s boost formula</p>
                <p className="display relative mt-6 text-[21px] !leading-[1.5] tracking-[0.03em] sm:text-[27px]">
                  <span className="block">
                    boost <span className={op}>=</span> min( 5, 1 <span className={op}>+</span> 4 <span className={op}>×</span>
                  </span>
                  <span className="block whitespace-nowrap pl-[1em]">
                    (<span className="text-gold">your {caps("veBTC")} share</span>)<sup className="text-[0.55em]">−1</sup>
                  </span>
                  <span className="block whitespace-nowrap pl-[1em]">
                    <span className={op}>×</span> <span className="energy-text">{caps("veMEZO")} share</span> )
                  </span>
                </p>
                <div className="relative mt-7 grid gap-4 border-t border-line pt-6 text-[14px] leading-relaxed text-ink/65 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-gold">Your veBTC share</span> is your veBTC’s voting power over all veBTC voting power.
                  </p>
                  <p>
                    <span className="font-semibold text-violet-hi">veMEZO share</span> is the veMEZO voting on your boost gauge over all veMEZO.
                  </p>
                </div>
              </div>
              <div className="hud mt-4 p-5 sm:p-6">
                <p className="mb-4 flex items-center gap-2.5">
                  <span className="hud-pulse h-2 w-2 bg-ok shadow-[0_0_10px_rgba(62,224,161,0.8)]" aria-hidden />
                  <span className="eyebrow !text-[12px] !text-ok">Right now on Mezo testnet</span>
                </p>
                <BoostLive />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 3. guardrails */}
        <section className="mt-28 md:mt-40" aria-labelledby="guards">
          <Reveal className="max-w-[760px]">
            <SectionTag n={3} label="Guardrails" />
            <h2 id="guards" className="display balance mt-5 scroll-mt-[150px] text-[clamp(36px,4.4vw,58px)]">
              Limits the contract <span className="energy-text">enforces.</span>
            </h2>
            <p className="pretty mt-5 max-w-[580px] text-[16.5px] leading-[1.65] text-ink/70">
              The AI proposes. The FlywheelPilot contract checks every vote and every reinvestment against the limits you signed, and reverts anything
              outside them. Every vote also publishes the full plan, and every reinvestment carries its hash.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" gap={0.05}>
            {GUARDS.map((g, i) => (
              <StaggerItem key={g.t} className="hud flex flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="hud-num text-[13px] tracking-[0.18em] text-gold">0{i + 1}</span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                  <span className={`h-1.5 w-1.5 ${g.e ? "bg-red" : "bg-ok"}`} aria-hidden />
                </div>
                <p className="display mt-4 text-[21px] !leading-[1.05] tracking-[0.02em]">{caps(g.t)}</p>
                <p className="pretty mt-3 text-[14px] leading-relaxed text-ink/65">{g.d}</p>
                {g.e && (
                  <p className="mt-auto pt-5 text-[12.5px] text-faint">
                    reverts with <code className="font-mono text-[12px] text-red">{g.e}</code>
                  </p>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 4. contracts */}
        <section className="mt-28 md:mt-40" aria-labelledby="contracts">
          <Reveal className="max-w-[760px]">
            <SectionTag n={4} label="Onchain" />
            <h2 id="contracts" className="display balance mt-5 scroll-mt-[150px] text-[clamp(34px,4vw,52px)]">
              Mezo contracts it <span className="energy-text">works with.</span>
            </h2>
            <p className="mt-4 text-[16px] text-ink/70">All on Mezo testnet. Each address opens in the Mezo explorer.</p>
          </Reveal>
          <Reveal className="card mt-10 overflow-hidden">
            <ul className="divide-y divide-line">
              {contracts.map((c, i) => (
                <li key={c.name}>
                  <a
                    href={addrUrl(c.addr)}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid gap-1 px-6 py-5 transition-colors hover:bg-violet/[0.06] sm:grid-cols-[36px_200px_1fr_auto] sm:items-center sm:gap-6 sm:px-8"
                  >
                    <span className="hud-num hidden text-[13px] tracking-[0.14em] text-faint transition-colors group-hover:text-gold sm:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-[18px] font-bold tracking-[0.03em]">{c.name}</span>
                    <span className="text-[14px] text-muted">{c.what}</span>
                    <span className="tnum inline-flex items-center gap-1.5 font-mono text-[13px] text-violet-hi/85 group-hover:text-violet-hi">
                      {c.addr.slice(0, 8)}…{c.addr.slice(-6)} <ExternalArrow />
                    </span>
                  </a>
                </li>
              ))}
              {!PILOT_ADDRESS && (
                <li className="grid gap-1 px-6 py-5 sm:grid-cols-[36px_200px_1fr_auto] sm:items-center sm:gap-6 sm:px-8">
                  <span className="hud-num hidden text-[13px] tracking-[0.14em] text-faint sm:block">{String(contracts.length + 1).padStart(2, "0")}</span>
                  <span className="font-[family-name:var(--font-display)] text-[18px] font-bold tracking-[0.03em]">FlywheelPilot</span>
                  <span className="text-[14px] text-muted">Flywheel’s contract: the guardrails above</span>
                  <span className="font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">deploying to testnet</span>
                </li>
              )}
            </ul>
          </Reveal>
          <Reveal className="mt-14 flex flex-wrap gap-3">
            <Link href="/app" className="btn btn-ink">
              Open the app <Arrow />
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to the overview
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
