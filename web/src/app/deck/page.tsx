import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { FlywheelMark } from "@/components/brand/FlywheelMark";
import "./deck.css";

export const metadata: Metadata = {
  title: "Deck",
  description: "Flywheel, the autopilot for Mezo veBTC: the pitch deck for Mezo WaveHack Wave 2.",
};

const EXPLORER = "https://explorer.test.mezo.org";
const PILOT = "0x22cfe1B060Aa7E10Ae6D114346Cc4f6B8550aab3";
const TOTAL = 10;

function Foot({ n, dark = false }: { n: number; dark?: boolean }) {
  return (
    <div className="s-foot">
      <span className="flex items-center gap-[0.6cqw]">
        <FlywheelMark size={18} className={dark ? "text-white" : "text-ink"} />
        <span className="font-semibold" style={{ color: dark ? "#fff" : "var(--color-ink)" }}>
          Flywheel
        </span>
        <span>· Mezo WaveHack Wave 2</span>
      </span>
      <span className="tnum">
        {n} / {TOTAL}
      </span>
    </div>
  );
}

function Loop() {
  // four stations on a ring, a comet of energy running clockwise from Vote
  const st = [
    { a: -90, t: "Vote", d: "the best split, inside your caps" },
    { a: 0, t: "Harvest", d: "incentives and fees, paid to you" },
    { a: 90, t: "Boost", d: "MUSD incentives for veMEZO votes" },
    { a: 180, t: "Save", d: "MUSD into the Savings Vault" },
  ];
  const c = 50;
  const r = 28;
  const pt = (deg: number, rr = r) => [c + rr * Math.cos((deg * Math.PI) / 180), c + rr * Math.sin((deg * Math.PI) / 180)];
  const [x0, y0] = pt(-90);
  const [x1, y1] = pt(150);
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="deckComet" x1={x0} y1={y0} x2={x1} y2={y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6B0036" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#6B0036" />
          <stop offset="1" stopColor="#FF004D" />
        </linearGradient>
      </defs>
      <circle cx={c} cy={c} r={r} stroke="#171717" strokeOpacity="0.1" strokeWidth="3.4" fill="none" />
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`} stroke="url(#deckComet)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <circle cx={x1} cy={y1} r="2.6" fill="#FF004D" />
      {st.map((s) => {
        const [x, y] = pt(s.a);
        const [lx, ly] = pt(s.a, 42);
        return (
          <g key={s.t}>
            <circle cx={x} cy={y} r="4.2" fill="#fff" stroke="#171717" strokeWidth="1.1" />
            <text x={lx} y={ly + 1.5} textAnchor="middle" fontSize="4.2" fontWeight="600" fill="#171717" letterSpacing="-0.12">
              {s.t}
            </text>
          </g>
        );
      })}
      <text x={c} y={c - 1.5} textAnchor="middle" fontSize="4.4" fontWeight="600" fill="#171717" letterSpacing="-0.15">
        every epoch
      </text>
      <text x={c} y={c + 4.5} textAnchor="middle" fontSize="3.2" fill="#626262">
        Thursday 00:00 UTC
      </text>
    </svg>
  );
}

export default function DeckPage() {
  return (
    <main className="deck">
      <div className="deck-bar">
        <Logo />
        <div className="flex items-center gap-2">
          <a href="/Flywheel-deck.pdf" className="btn btn-ghost btn-sm">
            Download PDF
          </a>
          <Link href="/app" className="btn btn-ink btn-sm">
            Open the app
          </Link>
        </div>
      </div>

      {/* 1. Title */}
      <section className="slide ink" aria-label="Flywheel">
        <div className="slide-in justify-center">
          <svg className="pointer-events-none absolute right-[-12cqw] top-1/2 h-[56cqw] w-[56cqw] -translate-y-1/2" viewBox="0 0 32 32" fill="none" aria-hidden>
            <defs>
              <linearGradient id="deckHero" x1="16" y1="4.5" x2="10" y2="26.5" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6B0036" stopOpacity="0" />
                <stop offset="0.5" stopColor="#6B0036" />
                <stop offset="1" stopColor="#FF004D" />
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="11.5" stroke="#fff" strokeOpacity="0.1" strokeWidth="2.2" />
            <path d="M16 4.5A11.5 11.5 0 1 1 10.25 25.96" stroke="url(#deckHero)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="10.25" cy="25.96" r="1.15" fill="#FF004D" />
            {[
              [16, 4.5],
              [27.5, 16],
              [16, 27.5],
              [4.5, 16],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.42" fill="#fff" fillOpacity="0.8" />
            ))}
          </svg>
          <p className="s-kicker">Mezo WaveHack · Wave 2</p>
          <h1 className="s-title xl mt-[1.6cqw]">
            Your veBTC,
            <br />
            <span className="serif-accent energy-text-dark">on autopilot.</span>
          </h1>
          <p className="s-lede !max-w-[48cqw]">
            Flywheel votes, harvests and compounds Mezo veBTC every epoch, inside limits the owner sets onchain, and publishes its reasoning with every vote.
          </p>
          <p className="mt-[3cqw] text-[1.4cqw] font-semibold">flywheel-mezo.vercel.app</p>
        </div>
        <Foot n={1} dark />
      </section>

      {/* 2. Problem */}
      <section className="slide paper" aria-label="The problem">
        <div className="slide-in">
          <p className="s-kicker">The problem</p>
          <h2 className="s-title">
            A veBTC only earns if someone <span className="serif-accent energy-text">shows up</span> every Thursday.
          </h2>
          <div className="s-grid-2 mt-[3.4cqw] !grid-cols-4">
            {[
              ["Vote", "Split it across 17 live gauges (28 on mainnet), weighing incentives against crowding."],
              ["Claim", "Pull incentives and fees from every gauge it voted."],
              ["Boost", "Pay veMEZO voters to lift its voting power up to 5×."],
              ["Reinvest", "Put the MUSD to work instead of leaving it idle."],
            ].map(([t, d], i) => (
              <div key={t} className="s-tile">
                <p className="serif-accent text-[2.4cqw] leading-none text-red">{i + 1}</p>
                <p className="s-h mt-[1.2cqw]">{t}</p>
                <p className="s-body mt-[0.6cqw] !text-[1.25cqw]">{d}</p>
              </div>
            ))}
          </div>
          <p className="s-lede !mt-[3cqw] !max-w-[70cqw]">
            Every week, by hand. Most holders vote once and forget, or pile into the most crowded gauge, where each vote earns least.
          </p>
        </div>
        <Foot n={2} />
      </section>

      {/* 3. What it does */}
      <section className="slide" aria-label="What Flywheel does">
        <div className="slide-in">
          <p className="s-kicker">What Flywheel does</p>
          <h2 className="s-title max-w-[60cqw]">
            One loop, run for you, <span className="serif-accent energy-text">every epoch.</span>
          </h2>
          <div className="mt-[2.4cqw] grid flex-1 grid-cols-[30cqw_1fr] items-center gap-[4cqw] pb-[4cqw]">
            <div className="aspect-square w-[30cqw]">
              <Loop />
            </div>
            <ol className="flex flex-col gap-[1.6cqw]">
              {[
                ["Vote", "The brain finds the split that earns most per vote once crowding is counted. The contract checks it against your limits, votes through Mezo's PoolsVoter, and publishes the plan in the same transaction."],
                ["Harvest", "Claims incentives and fees through PoolsVoter. Mezo pays them straight to you; Flywheel never holds rewards."],
                ["Boost", "Posts MUSD incentives on your veBTC's own boost gauge (BoostVoter) to attract veMEZO votes."],
                ["Save", "Deposits the rest in the MUSD Savings Vault and sends the sMUSD to you."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[2.6cqw_1fr] gap-[1cqw]">
                  <span className="serif-accent text-[2.2cqw] leading-none text-red">{i + 1}</span>
                  <div>
                    <p className="s-h">{t}</p>
                    <p className="s-body mt-[0.3cqw] !text-[1.3cqw]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <Foot n={3} />
      </section>

      {/* 4. The brain */}
      <section className="slide paper" aria-label="The brain">
        <div className="slide-in">
          <div className="grid h-full grid-cols-[1fr_31cqw] gap-[4cqw]">
            <div className="flex flex-col">
              <p className="s-kicker">The brain</p>
              <h2 className="s-title">
                It does the maths, <span className="serif-accent energy-text">then shows it.</span>
              </h2>
              <div className="mt-[2.6cqw] flex flex-col gap-[1.5cqw]">
                {[
                  ["Optimize", "Your share of a gauge is v/(V+v), so every extra vote earns a little less. Flywheel maximizes total rewards under your per-pool cap and minimum pool count, using water-filling, and benchmarks every plan against copying the crowd's split, going all-in, and splitting evenly."],
                  ["Price the boost", "Uses Mezo's boost formula to work out how much veMEZO lifts your power, and bids only when the boost is worth more than it costs. If nobody is bidding, it offers half the value."],
                  ["Explain", "Claude (claude-sonnet-5-5) writes the why in plain English. A guard rejects any explanation that quotes a number not in the plan, and a deterministic template steps in."],
                ].map(([t, d]) => (
                  <div key={t}>
                    <p className="s-h">{t}</p>
                    <p className="s-body mt-[0.35cqw] !text-[1.3cqw]">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="s-shot self-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/deck/plan-card.png" alt="Flywheel's live plan for veBTC #1752: 60% to the MUSD Savings Vault, 40% to MUSD/BTC" />
            </div>
          </div>
        </div>
        <Foot n={4} />
      </section>

      {/* 5. Guardrails */}
      <section className="slide" aria-label="Non-custodial guardrails">
        <div className="slide-in">
          <p className="s-kicker">Non-custodial by construction</p>
          <h2 className="s-title">
            Your veBTC never <span className="serif-accent energy-text">leaves your wallet.</span>
          </h2>
          <p className="s-lede !mt-[1.2cqw] !max-w-[80cqw] !text-[1.45cqw]">
            You approve the contract on the NFT and enroll with a policy. FlywheelPilot checks it on every keeper call:
          </p>
          <div className="mt-[1.4cqw] max-w-[80cqw]">
            {[
              ["Most of your votes in any one pool", "vote reverts PoolShareTooHigh"],
              ["Spread across at least N pools", "vote reverts TooFewPools"],
              ["Pools you never want, or dead gauges", "vote reverts PoolNotAllowed"],
              ["Weekly MUSD reinvest budget", "compound reverts OverEpochCap"],
              ["Share of a compound that may buy boost", "compound reverts BoostShareTooHigh"],
              ["You sold or moved the NFT", "every action reverts OwnerChanged"],
              ["You want out", "exit() any time, or revoke the approval"],
            ].map(([a, b]) => (
              <div key={a} className="s-row">
                <b>{a}</b>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <p className="s-body mt-[1.2cqw] !text-[1.25cqw]">
            Boost incentives only go to your own boost gauge. sMUSD only goes to you. The fee is capped at 10% in code.
          </p>
        </div>
        <Foot n={5} />
      </section>

      {/* 6. Live on testnet */}
      <section className="slide paper" aria-label="Live on Mezo testnet">
        <div className="slide-in">
          <p className="s-kicker">Live on Mezo testnet</p>
          <h2 className="s-title">
            Deployed, verified, <span className="serif-accent energy-text">already piloting.</span>
          </h2>
          <div className="s-grid-3 mt-[2.2cqw]">
            <div className="s-tile">
              <p className="s-num">2</p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">demo veBTC piloted</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">Our own #1752 and #1753, owned by a wallet separate from the keeper, each under its own limits. No outside users yet.</p>
            </div>
            <div className="s-tile">
              <p className="s-num">2</p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">plans published onchain</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">Each vote carries its full plan and reasoning in a PlanPublished event, read back by the app.</p>
            </div>
            <div className="s-tile">
              <p className="s-num">
                160 <span className="text-[2.4cqw]">MUSD</span>
              </p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">compounded</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">120.65 sMUSD to the owner, 31.35 MUSD of boost incentives on two new boost gauges, 8 MUSD fee.</p>
            </div>
          </div>
          <div className="mt-[1.8cqw] max-w-[84cqw]">
            {[
              ["FlywheelPilot (verified)", `${PILOT.slice(0, 10)}…${PILOT.slice(-6)}`, `${EXPLORER}/address/${PILOT}`],
              ["#1752 vote: 60% Savings Vault / 40% MUSD-BTC", "0x36e5ae…08dd20", `${EXPLORER}/tx/0x36e5ae6efd02e43972df4309ff64a0ff6bcd17a5a23765deea5920c5c308dd20`],
              ["#1752 compound: 100 MUSD", "0x4fedc1…0372c6", `${EXPLORER}/tx/0x4fedc1b2588c783ca7db5eb5ae8b18afe2bbab0cc6264586b8f2d3c3d06372c6`],
            ].map(([a, b, href]) => (
              <div key={a} className="s-row k !grid-cols-[34cqw_1fr]">
                <b>{a}</b>
                <a className="s-link s-code" href={href}>
                  {b}
                </a>
              </div>
            ))}
          </div>
          <p className="s-body mt-[1cqw] !text-[1.2cqw]">
            On that epoch's live data, #1752's plan expected $15.97 against $7.62 for copying the crowd's split (+110%).
          </p>
        </div>
        <Foot n={6} />
      </section>

      {/* 7. Mainnet fork */}
      <section className="slide ink" aria-label="Proven against Mezo mainnet">
        <div className="slide-in justify-center">
          <p className="s-kicker">Proven against Mezo mainnet</p>
          <p className="mt-[1.6cqw] text-[10.5cqw] font-semibold leading-[0.9] tracking-[-0.035em]">
            21.0099 <span className="serif-accent energy-text-dark text-[6cqw] tracking-normal">MUSD</span>
          </p>
          <p className="s-lede !max-w-[70cqw]">
            harvested by Flywheel for a real veBTC (#5803) on a fork of Mezo mainnet at block 13,202,859, one block before its owner claimed by hand. The exact amount Mezo owed lands in the owner's wallet. The contract keeps nothing.
          </p>
          <p className="s-body mt-[2cqw] max-w-[70cqw]">
            The same fork pushes a capped 70/30 vote through the live mainnet PoolsVoter, and rejects the holder's real all-in vote under a 70% cap. 22 unit and fuzz tests, 3 testnet-fork and 2 mainnet-fork tests pass.
          </p>
        </div>
        <Foot n={7} dark />
      </section>

      {/* 8. Mezo integration */}
      <section className="slide" aria-label="Mezo integration">
        <div className="slide-in">
          <p className="s-kicker">Built into Mezo, not beside it</p>
          <h2 className="s-title">
            Seven Mezo pieces, <span className="serif-accent energy-text">one loop.</span>
          </h2>
          <div className="mt-[2cqw] max-w-[88cqw]">
            {[
              ["veBTC", "approval, ownership and power gate every action; power and lock feed the brain"],
              ["PoolsVoter", "vote with the plan's split; claimBribes and claimFees harvest; isAlive and lastVoted checks"],
              ["BoostVoter + boost gauge factory", "createBoostGauge for the veBTC, addBribes with MUSD, getBoost read back"],
              ["MUSD", "the compounding currency, with an owner allowance and a weekly cap"],
              ["MUSD Savings Vault (sMUSD)", "auto-save destination, and a votable gauge the brain often favours"],
              ["veMEZO", "total and per-gauge voting power priced into every boost decision"],
              ["Mezo Passport", "wallet connection in the app"],
            ].map(([a, b]) => (
              <div key={a} className="s-row k !py-[1.15cqw] !text-[1.45cqw]">
                <b>{a}</b>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <Foot n={8} />
      </section>

      {/* 9. Business */}
      <section className="slide paper" aria-label="Business model">
        <div className="slide-in">
          <p className="s-kicker">Business model</p>
          <h2 className="s-title">
            Paid only when your money <span className="serif-accent energy-text">goes back to work.</span>
          </h2>
          <div className="s-grid-3 mt-[3cqw]">
            <div className="s-tile sand">
              <p className="s-num">5%</p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">of compounded MUSD</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">Goes to the treasury and pays the keeper: gas, the model call, monitoring. Capped at 10% in code.</p>
            </div>
            <div className="s-tile lime">
              <p className="s-num">$0</p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">to vote and harvest</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">A holder who only wants their votes cast well every week pays nothing.</p>
            </div>
            <div className="s-tile blush">
              <p className="s-h !text-[1.5cqw]">Who it's for</p>
              <p className="s-body mt-[0.6cqw] !text-[1.2cqw]">
                veBTC holders who don't vote by hand every Thursday: small lockers who never vote, and larger holders who leave boost and idle MUSD on the table.
              </p>
              <p className="s-h mt-[1.2cqw] !text-[1.5cqw]">How we reach them</p>
              <p className="s-body mt-[0.6cqw] !text-[1.2cqw]">Mezo Earn's community, ecosystem partners, and a public onchain track record for every piloted veBTC.</p>
            </div>
          </div>
          <p className="s-lede !mt-[3cqw] !max-w-[80cqw] !text-[1.5cqw]">
            As it ran on testnet: #1752 compounded 100 MUSD. 5 MUSD went to the treasury, 22.8 MUSD became boost incentives on its own boost gauge, and
            72.2 MUSD went into the Savings Vault as sMUSD for the owner.
          </p>
        </div>
        <Foot n={9} />
      </section>

      {/* 10. Roadmap + team */}
      <section className="slide ink" aria-label="Roadmap and team">
        <div className="slide-in">
          <p className="s-kicker">What's next</p>
          <h2 className="s-title">
            From testnet to <span className="serif-accent energy-text-dark">both sides of the boost market.</span>
          </h2>
          <div className="s-grid-3 mt-[3cqw]">
            {[
              ["Mainnet beta", "Audit FlywheelPilot, deploy on Mezo mainnet with a deposit cap, add a second keeper and Telegram alerts when a plan is published."],
              ["Boost market maker", "Pool boost bids across every Flywheel veBTC, and add a veMEZO autopilot that votes for the best boost incentives."],
              ["Managed veBTC", "Use Mezo managed locks so holders too small to justify gas can join a shared, Flywheel-piloted position."],
            ].map(([t, d], i) => (
              <div key={t} className="s-tile">
                <p className="serif-accent text-[2.4cqw] leading-none text-[#ff5c8d]">{i + 1}</p>
                <p className="s-h mt-[1cqw]">{t}</p>
                <p className="s-body mt-[0.5cqw] !text-[1.2cqw]">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-[4cqw] pb-[3.4cqw]">
            <div>
              <p className="text-[1.25cqw] text-white/55">Team</p>
              <p className="mt-[0.3cqw] text-[1.6cqw] font-semibold">0xdopewilly, solo: contracts, brain, keeper, frontend</p>
            </div>
            <div className="text-right text-[1.3cqw] leading-[1.6]">
              <p className="font-semibold">flywheel-mezo.vercel.app</p>
              <p className="text-white/55">github.com/0xdopewilly/flywheel-mezo</p>
            </div>
          </div>
        </div>
        <Foot n={10} dark />
      </section>
    </main>
  );
}
