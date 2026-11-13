import type { Metadata } from "next";
import Link from "next/link";
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

export default function HowPage() {
  const contracts = PILOT_ADDRESS ? [{ name: "FlywheelPilot", what: "Flywheel’s contract: the guardrails above", addr: PILOT_ADDRESS }, ...CONTRACTS] : CONTRACTS;
  return (
    <>
      <Nav />
      <main className="shell">
        <header className="pb-6 pt-10 md:pt-20">
          <Reveal>
            <h1 className="display balance max-w-[900px] text-[clamp(46px,7vw,100px)]">
              How the brain <span className="serif-accent energy-text">thinks.</span>
            </h1>
            <p className="pretty mt-7 max-w-[620px] text-[18px] leading-[1.6] text-ink/70">
              Each epoch Flywheel votes, harvests and reinvests. Here is the maths behind each decision in plain words, and the rules the contract
              holds it to.
            </p>
          </Reveal>
        </header>

        {/* 1. votes */}
        <section className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-16" aria-labelledby="votes">
          <Reveal>
            <p className="serif-accent text-[22px] text-red">One</p>
            <h2 id="votes" className="display balance mt-2 text-[clamp(32px,4vw,52px)]">
              Rewards per vote, <span className="serif-accent">minus the crowd.</span>
            </h2>
            <div className="pretty mt-6 flex max-w-[540px] flex-col gap-4 text-[16.5px] leading-[1.65] text-ink/75">
              <p>
                Every Mezo Earn gauge has a pot for the epoch: the incentives people posted plus the trading fees. The pot is split between everyone
                who voted for it, in proportion to their votes.
              </p>
              <p>
                So the size of the pot is not what matters. What matters is how much the <em className="serif-accent text-[1.08em]">next</em> vote
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
            <div className="rounded-[32px] bg-blush p-5 sm:p-8">
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <p className="text-[15px] font-semibold">Water-filling</p>
                <p className="text-[13px] text-muted">illustration</p>
              </div>
              <WaterFill />
            </div>
            <div className="mt-5 rounded-[24px] bg-white px-6 py-5">
              <p className="text-[13px] text-muted">Your share of a gauge’s pot</p>
              <p className="mt-2 text-[18px] leading-relaxed tracking-[-0.01em] sm:text-[21px]">
                pot <span className="text-muted">×</span> <span className="serif-accent text-[1.15em]">your votes</span>{" "}
                <span className="text-muted">÷</span>{" "}
                <span className="whitespace-nowrap">
                  ( <span className="serif-accent text-[1.15em]">everyone else’s</span> <span className="text-muted">+</span>{" "}
                  <span className="serif-accent text-[1.15em]">yours</span> )
                </span>
              </p>
            </div>
          </Reveal>
        </section>

        {/* 2. boost */}
        <section className="mt-28 md:mt-40" aria-labelledby="boost">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <Reveal>
              <p className="serif-accent text-[22px] text-red">Two</p>
              <h2 id="boost" className="display balance mt-2 text-[clamp(32px,4vw,52px)]">
                Boost: buying votes <span className="serif-accent">that multiply yours.</span>
              </h2>
              <div className="pretty mt-6 flex max-w-[540px] flex-col gap-4 text-[16.5px] leading-[1.65] text-ink/75">
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
              <div className="rounded-[32px] bg-ink p-7 text-white sm:p-10">
                <p className="text-[14px] text-white/60">Mezo’s boost formula</p>
                <p className="mt-5 text-[22px] leading-[1.5] tracking-[-0.01em] sm:text-[28px]">
                  boost <span className="text-white/50">=</span> min( 5, 1 <span className="text-white/50">+</span> 4{" "}
                  <span className="text-white/50">×</span>{" "}
                  <span className="whitespace-nowrap">
                    (<span className="serif-accent text-[1.12em]">your veBTC share</span>)
                    <sup className="text-[0.55em]">−1</sup>
                  </span>{" "}
                  <span className="text-white/50">×</span> <span className="serif-accent energy-text-dark text-[1.12em]">veMEZO share</span> )
                </p>
                <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 text-[14px] leading-relaxed text-white/70 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-white">Your veBTC share</span> is your veBTC’s voting power over all veBTC voting power.
                  </p>
                  <p>
                    <span className="font-semibold text-white">veMEZO share</span> is the veMEZO voting on your boost gauge over all veMEZO.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-[24px] bg-white p-6">
                <p className="mb-4 text-[13px] text-muted">Right now on Mezo testnet</p>
                <BoostLive />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 3. guardrails */}
        <section className="mt-28 md:mt-40" aria-labelledby="guards">
          <Reveal className="max-w-[760px]">
            <p className="serif-accent text-[22px] text-red">Three</p>
            <h2 id="guards" className="display balance mt-2 text-[clamp(32px,4vw,52px)]">
              Limits the contract <span className="serif-accent">enforces.</span>
            </h2>
            <p className="pretty mt-5 max-w-[580px] text-[16.5px] leading-[1.65] text-ink/75">
              The AI proposes. The FlywheelPilot contract checks every vote and every reinvestment against the limits you signed, and reverts anything
              outside them. Every vote also publishes the full plan, and every reinvestment carries its hash.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" gap={0.05}>
            {GUARDS.map((g, i) => (
              <StaggerItem key={g.t} className={`rounded-[24px] p-6 ${["bg-sand", "bg-lime", "bg-blush", "bg-sky-soft"][i % 4]}`}>
                <p className="text-[16px] font-semibold leading-snug tracking-[-0.015em]">{g.t}</p>
                <p className="pretty mt-2 text-[14px] leading-relaxed text-ink/70">{g.d}</p>
                {g.e && <p className="mt-4 text-[12.5px] text-ink/50">reverts with {g.e}</p>}
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* 4. contracts */}
        <section className="mt-28 md:mt-40" aria-labelledby="contracts">
          <Reveal className="max-w-[760px]">
            <h2 id="contracts" className="display balance text-[clamp(30px,3.6vw,46px)]">
              Mezo contracts it <span className="serif-accent">works with.</span>
            </h2>
            <p className="mt-4 text-[16px] text-ink/70">All on Mezo testnet. Each address opens in the Mezo explorer.</p>
          </Reveal>
          <Reveal className="card mt-10 overflow-hidden">
            <ul className="divide-y divide-line">
              {contracts.map((c) => (
                <li key={c.name}>
                  <a
                    href={addrUrl(c.addr)}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid gap-1 px-6 py-5 transition-colors hover:bg-paper/60 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:gap-6 sm:px-8"
                  >
                    <span className="text-[15.5px] font-semibold tracking-[-0.01em]">{c.name}</span>
                    <span className="text-[14px] text-muted">{c.what}</span>
                    <span className="tnum inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink/80 group-hover:text-ink">
                      {c.addr.slice(0, 8)}…{c.addr.slice(-6)} <ExternalArrow />
                    </span>
                  </a>
                </li>
              ))}
              {!PILOT_ADDRESS && (
                <li className="grid gap-1 px-6 py-5 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:gap-6 sm:px-8">
                  <span className="text-[15.5px] font-semibold tracking-[-0.01em]">FlywheelPilot</span>
                  <span className="text-[14px] text-muted">Flywheel’s contract: the guardrails above</span>
                  <span className="text-[13.5px] text-muted">deploying to testnet</span>
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
