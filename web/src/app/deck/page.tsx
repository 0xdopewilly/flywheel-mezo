import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
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
const pad = (n: number) => String(n).padStart(2, "0");

/** Mezo's lowercase prefixes stay lowercase inside uppercase headings. */
function Ve({ children }: { children: string }) {
  return <span className="normal-case">{children}</span>;
}

/** Same, for strings rendered inside uppercase type. */
function caps(text: string) {
  return text.split(/\b(ve[A-Z]+|sMUSD)\b/).map((part, i) => (i % 2 ? <Ve key={i}>{part}</Ve> : part));
}

/** The HUD frame drawn on every slide, in the 1600x900 PDF coordinate space. */
function Frame() {
  const L = 28;
  const T = 28;
  const R = 1600 - 28;
  const B = 900 - 28;
  const k = 30;
  const outline = `M ${L + k} ${T} H ${R} V ${B - k} L ${R - k} ${B} H ${L} V ${T + k} Z`;
  return (
    <svg className="s-frame" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden>
      <path d={outline} fill="none" stroke="#B69CFF" strokeOpacity="0.28" strokeWidth="1.2" />
      {/* the two cut corners, brighter */}
      <path d={`M ${L} ${T + k + 40} V ${T + k} L ${L + k} ${T} H ${L + k + 40}`} fill="none" stroke="#B69CFF" strokeOpacity="0.8" strokeWidth="1.4" />
      <path d={`M ${R} ${B - k - 40} V ${B - k} L ${R - k} ${B} H ${R - k - 40}`} fill="none" stroke="#B69CFF" strokeOpacity="0.8" strokeWidth="1.4" />
      {/* top and bottom tabs */}
      <path d={`M 690 ${T} H 910 L 894 ${T + 7} H 706 Z`} fill="#8B5CF6" />
      <path d={`M 706 ${B - 6} H 894 L 910 ${B} H 690 Z`} fill="#8B5CF6" fillOpacity="0.55" />
      {/* corner brackets on the square corners */}
      <path d={`M ${R - 44} ${T + 14} H ${R - 14} V ${T + 44}`} fill="none" stroke="#B69CFF" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d={`M ${L + 14} ${B - 44} V ${B - 14} H ${L + 44}`} fill="none" stroke="#B69CFF" strokeOpacity="0.55" strokeWidth="1.2" />
      {/* side ruler */}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={L + 10} x2={L + (i % 4 === 0 ? 24 : 17)} y1={354 + i * 16} y2={354 + i * 16} stroke="#B69CFF" strokeOpacity={i % 4 === 0 ? 0.55 : 0.3} strokeWidth="1" />
      ))}
      {/* dot matrix, right edge */}
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={R - 26 + (i % 3) * 7} cy={410 + Math.floor(i / 3) * 7} r="1.1" fill="#B69CFF" fillOpacity="0.4" />
      ))}
    </svg>
  );
}

function Foot({ n }: { n: number }) {
  return (
    <div className="s-foot">
      <span className="s-brand">
        <FlywheelMark size={18} className="text-ink" />
        <b>Flywheel</b>
        <span>· Mezo WaveHack Wave 2</span>
      </span>
      <span className="s-prog">
        <span className="s-segs" aria-hidden>
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i < n ? (i === n - 1 ? "on cur" : "on") : undefined} />
          ))}
        </span>
        <span className="tnum">
          <b>{pad(n)}</b> / {TOTAL}
        </span>
      </span>
    </div>
  );
}

/** Title-slide object: a glowing flywheel with a Bitcoin-gold core, drawn in SVG so it prints. */
function HeroWheel({ className }: { className?: string }) {
  const C = 300;
  const p = (deg: number, r: number) => [C + r * Math.cos(((deg - 90) * Math.PI) / 180), C + r * Math.sin(((deg - 90) * Math.PI) / 180)];
  const arc = (a0: number, a1: number, r: number) => {
    const [x0, y0] = p(a0, r);
    const [x1, y1] = p(a1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const [cx0, cy0] = p(-40, 228);
  const [cx1, cy1] = p(150, 228);
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden>
      <defs>
        <radialGradient id="hw-glow">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#6D28D9" stopOpacity="0.2" />
          <stop offset="1" stopColor="#6D28D9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hw-core" cx="0.4" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#FFF4D6" />
          <stop offset="0.28" stopColor="#FFD27A" />
          <stop offset="0.62" stopColor="#F5B53D" />
          <stop offset="1" stopColor="#B4650E" />
        </radialGradient>
        <radialGradient id="hw-core-glow">
          <stop offset="0" stopColor="#F5B53D" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#F5B53D" stopOpacity="0.18" />
          <stop offset="1" stopColor="#F5B53D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hw-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#D6C6FF" />
          <stop offset="0.7" stopColor="#9D6BFF" />
          <stop offset="1" stopColor="#E9DFFF" />
        </linearGradient>
        <linearGradient id="hw-comet" x1={cx0} y1={cy0} x2={cx1} y2={cy1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0" />
          <stop offset="0.55" stopColor="#C026D3" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FF7AD9" />
        </linearGradient>
        <filter id="hw-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="hw-blur-sm" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <circle cx={C} cy={C} r="300" fill="url(#hw-glow)" />
      {/* teeth */}
      {Array.from({ length: 96 }, (_, i) => {
        const a = i * 3.75;
        const [x0, y0] = p(a, 250);
        const [x1, y1] = p(a, i % 2 ? 266 : 278);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#C9B6FF" strokeOpacity={i % 2 ? 0.45 : 0.8} strokeWidth="4.2" />;
      })}
      <circle cx={C} cy={C} r="250" fill="none" stroke="#B69CFF" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* rim */}
      <circle cx={C} cy={C} r="228" fill="none" stroke="#B69CFF" strokeOpacity="0.55" strokeWidth="26" filter="url(#hw-blur)" />
      <circle cx={C} cy={C} r="228" fill="none" stroke="url(#hw-rim)" strokeWidth="17" />
      <circle cx={C} cy={C} r="236" fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.5" />
      <circle cx={C} cy={C} r="219" fill="none" stroke="#2A1250" strokeOpacity="0.9" strokeWidth="2" />
      {/* energy comet riding the rim */}
      <path d={arc(-40, 150, 228)} fill="none" stroke="url(#hw-comet)" strokeWidth="24" strokeLinecap="round" filter="url(#hw-blur-sm)" />
      <path d={arc(-40, 150, 228)} fill="none" stroke="url(#hw-comet)" strokeWidth="9" strokeLinecap="round" />
      <circle cx={cx1} cy={cy1} r="13" fill="#FFFFFF" filter="url(#hw-blur-sm)" />
      <circle cx={cx1} cy={cy1} r="7" fill="#FFFFFF" />
      {/* inner ring */}
      <circle cx={C} cy={C} r="168" fill="none" stroke="#C026D3" strokeOpacity="0.4" strokeWidth="12" filter="url(#hw-blur-sm)" />
      <circle cx={C} cy={C} r="168" fill="none" stroke="#D6C6FF" strokeOpacity="0.85" strokeWidth="3.5" />
      <circle cx={C} cy={C} r="150" fill="none" stroke="#B69CFF" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
      {/* spokes and stations */}
      {[45, 135, 225, 315].map((a) => {
        const [x0, y0] = p(a, 70);
        const [x1, y1] = p(a, 214);
        const [sx, sy] = p(a, 222);
        return (
          <g key={a}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#C9B6FF" strokeOpacity="0.45" strokeWidth="16" />
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="2" />
            <rect x={sx - 14} y={sy - 14} width="28" height="28" transform={`rotate(45 ${sx} ${sy})`} fill="#E3D8FF" filter="url(#hw-blur-sm)" opacity="0.8" />
            <rect x={sx - 10} y={sy - 10} width="20" height="20" transform={`rotate(45 ${sx} ${sy})`} fill="#F1ECFF" stroke="#8B5CF6" strokeWidth="2" />
          </g>
        );
      })}
      {/* gold core */}
      <circle cx={C} cy={C} r="128" fill="url(#hw-core-glow)" />
      <circle cx={C} cy={C} r="64" fill="url(#hw-core)" />
      <circle cx={C} cy={C} r="64" fill="none" stroke="#FFE3A3" strokeWidth="3" />
      <circle cx={C} cy={C} r="50" fill="none" stroke="#9A5509" strokeOpacity="0.55" strokeWidth="2" />
      <rect x={C - 20} y={C - 20} width="40" height="40" transform={`rotate(45 ${C} ${C})`} fill="none" stroke="#7A4306" strokeOpacity="0.75" strokeWidth="3" />
      <rect x={C - 9} y={C - 9} width="18" height="18" transform={`rotate(45 ${C} ${C})`} fill="#7A4306" fillOpacity="0.6" />
      {/* particles */}
      {[
        [96, 132, 2.2],
        [508, 120, 1.6],
        [540, 300, 2],
        [470, 520, 1.8],
        [120, 470, 2.4],
        [60, 300, 1.4],
        [300, 30, 1.8],
        [380, 568, 1.5],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#E3D8FF" fillOpacity="0.8" />
      ))}
    </svg>
  );
}

function Loop() {
  // four stations on a ring, a comet of energy running clockwise from Vote
  const st = [
    { a: -90, t: "Vote" },
    { a: 0, t: "Harvest" },
    { a: 90, t: "Boost" },
    { a: 180, t: "Save" },
  ];
  const c = 50;
  const r = 28;
  const pt = (deg: number, rr = r) => [c + rr * Math.cos((deg * Math.PI) / 180), c + rr * Math.sin((deg * Math.PI) / 180)];
  const [x0, y0] = pt(-90);
  const [x1, y1] = pt(150);
  const display = { fontFamily: "var(--font-display)" };
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="deckComet" x1={x0} y1={y0} x2={x1} y2={y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D28D9" stopOpacity="0.1" />
          <stop offset="0.55" stopColor="#B69CFF" />
          <stop offset="1" stopColor="#E879F9" />
        </linearGradient>
        <radialGradient id="deckLoopGlow">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <filter id="deckLoopBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <circle cx={c} cy={c} r="40" fill="url(#deckLoopGlow)" />
      {/* tick ring */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = i * 6;
        const [ax, ay] = pt(a, 33.5);
        const [bx, by] = pt(a, i % 5 === 0 ? 36 : 35);
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#B69CFF" strokeOpacity={i % 5 === 0 ? 0.6 : 0.28} strokeWidth="0.35" />;
      })}
      <circle cx={c} cy={c} r={r} stroke="#B69CFF" strokeOpacity="0.16" strokeWidth="3.4" fill="none" />
      <circle cx={c} cy={c} r={r - 6} stroke="#B69CFF" strokeOpacity="0.25" strokeWidth="0.3" strokeDasharray="0.6 1.4" fill="none" />
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`} stroke="url(#deckComet)" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#deckLoopBlur)" opacity="0.6" />
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`} stroke="url(#deckComet)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <circle cx={x1} cy={y1} r="2.4" fill="#FFFFFF" />
      {st.map((s, i) => {
        const [x, y] = pt(s.a);
        const [lx, ly] = pt(s.a, s.a === 0 || s.a === 180 ? 37.5 : 43);
        const anchor = s.a === 0 ? "start" : s.a === 180 ? "end" : "middle";
        return (
          <g key={s.t}>
            <rect x={x - 3.2} y={y - 3.2} width="6.4" height="6.4" transform={`rotate(45 ${x} ${y})`} fill="#0D0718" stroke={i === 0 ? "#F5B53D" : "#B69CFF"} strokeWidth="0.9" />
            <rect x={x - 1.2} y={y - 1.2} width="2.4" height="2.4" transform={`rotate(45 ${x} ${y})`} fill={i === 0 ? "#F5B53D" : "#B69CFF"} />
            <text x={lx} y={ly + 1.5} textAnchor={anchor} fontSize="4" fontWeight="700" fill="#F1ECFF" letterSpacing="0.5" style={display}>
              {s.t.toUpperCase()}
            </text>
          </g>
        );
      })}
      <text x={c} y={c - 0.5} textAnchor="middle" fontSize="5" fontWeight="700" fill="#F1ECFF" letterSpacing="0.3" style={display}>
        EVERY EPOCH
      </text>
      <text x={c} y={c + 5} textAnchor="middle" fontSize="3" fontWeight="600" fill="#F5B53D" letterSpacing="0.3" style={display}>
        Thursday 00:00 UTC
      </text>
    </svg>
  );
}

/** Concentric HUD rings for the mainnet slide. */
function Rings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <circle cx="200" cy="200" r="190" fill="none" stroke="#B69CFF" strokeOpacity="0.14" strokeWidth="1" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#B69CFF" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 6" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="#F5B53D" strokeOpacity="0.3" strokeWidth="1.2" />
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i * 5 * Math.PI) / 180;
        const r0 = 172;
        const r1 = i % 6 === 0 ? 186 : 180;
        return (
          <line
            key={i}
            x1={200 + r0 * Math.cos(a)}
            y1={200 + r0 * Math.sin(a)}
            x2={200 + r1 * Math.cos(a)}
            y2={200 + r1 * Math.sin(a)}
            stroke="#B69CFF"
            strokeOpacity={i % 6 === 0 ? 0.5 : 0.22}
            strokeWidth="1.4"
          />
        );
      })}
      <path d="M 200 10 A 190 190 0 0 1 390 200" fill="none" stroke="#B69CFF" strokeOpacity="0.7" strokeWidth="2.5" />
      <path d="M 200 310 A 110 110 0 0 1 90 200" fill="none" stroke="#F5B53D" strokeOpacity="0.85" strokeWidth="2.5" />
    </svg>
  );
}

export default function DeckPage() {
  return (
    <main className="deck">
      <div className="deck-bar">
        <Logo />
        <div className="flex items-center gap-2">
          <a href="https://youtu.be/35K6mhQ9tpU" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Watch the video
          </a>
          <a href="/Flywheel-deck.pdf" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            Download PDF
          </a>
          <Link href="/app" className="btn btn-ink btn-sm hidden sm:inline-flex">
            Open the app
          </Link>
        </div>
      </div>

      {/* 1. Title */}
      <section className="dark-island slide glow" aria-label="Flywheel">
        <Frame />
        <HeroWheel className="pointer-events-none absolute right-[3.5cqw] top-[46%] h-[42cqw] w-[42cqw] -translate-y-1/2" />
        <div className="slide-in justify-center">
          <p className="s-kicker">Mezo WaveHack · Wave 2</p>
          <h1 className="s-title xl mt-[2cqw]">
            Your <Ve>veBTC</Ve>,
            <br />
            <span className="energy-text">on autopilot.</span>
          </h1>
          <p className="s-lede !max-w-[44cqw]">
            Flywheel votes, harvests and compounds Mezo veBTC every epoch, inside limits the owner sets onchain, and publishes its reasoning with every vote.
          </p>
          <div className="mt-[3cqw] flex items-center gap-[2cqw]">
            <span className="s-plate">flywheel-mezo.vercel.app</span>
            <span className="s-live">
              <i /> Live on Mezo testnet
            </span>
          </div>
        </div>
        <Foot n={1} />
      </section>

      {/* 2. Problem */}
      <section className="dark-island slide" aria-label="The problem">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">The problem</p>
          <h2 className="s-title !max-w-[80cqw]">
            A <Ve>veBTC</Ve> only earns if someone <span className="energy-text">shows up</span> every Thursday.
          </h2>
          <div className="s-grid-4 mt-[3.4cqw]">
            {[
              ["Vote", "Split it across 17 live gauges (28 on mainnet), weighing incentives against crowding."],
              ["Claim", "Pull incentives and fees from every gauge it voted."],
              ["Boost", "Pay veMEZO voters to lift its voting power up to 5×."],
              ["Reinvest", "Put the MUSD to work instead of leaving it idle."],
            ].map(([t, d], i) => (
              <div key={t} className="s-tile">
                <div className="flex items-center gap-[0.8cqw]">
                  <span className="s-idx">{pad(i + 1)}</span>
                  <span className="h-px flex-1 bg-[rgb(167_139_250/0.2)]" />
                </div>
                <p className="s-h mt-[1.4cqw]">{t}</p>
                <p className="s-body mt-[0.7cqw] !text-[1.25cqw]">{d}</p>
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
      <section className="dark-island slide" aria-label="What Flywheel does">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">What Flywheel does</p>
          <h2 className="s-title">
            One loop, run for you, <span className="energy-text">every epoch.</span>
          </h2>
          <div className="mt-[2cqw] grid flex-1 grid-cols-[30cqw_1fr] items-center gap-[5cqw]">
            <div className="aspect-square w-[30cqw]">
              <Loop />
            </div>
            <ol className="flex flex-col">
              {[
                ["Vote", "The brain finds the split that earns most per vote once crowding is counted. The contract checks it against your limits, votes through Mezo's PoolsVoter, and publishes the plan in the same transaction."],
                ["Harvest", "Claims incentives and fees through PoolsVoter. Mezo pays them straight to you; Flywheel never holds rewards."],
                ["Boost", "Posts MUSD incentives on your veBTC's own boost gauge (BoostVoter) to attract veMEZO votes."],
                ["Save", "Deposits the rest in the MUSD Savings Vault and sends the sMUSD to you."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[3.6cqw_1fr] gap-[1cqw] border-t border-[rgb(167_139_250/0.14)] py-[1.15cqw] last:border-b">
                  <span className="s-idx pt-[0.35cqw]">{pad(i + 1)}</span>
                  <div>
                    <p className="s-h !text-[1.7cqw]">{t}</p>
                    <p className="s-body mt-[0.3cqw] !text-[1.25cqw]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <Foot n={3} />
      </section>

      {/* 4. The brain */}
      <section className="dark-island slide" aria-label="The brain">
        <Frame />
        <div className="slide-in">
          <div className="grid h-full grid-cols-[1fr_36cqw] gap-[4cqw]">
            <div className="flex flex-col">
              <p className="s-kicker">The brain</p>
              <h2 className="s-title">
                It does the maths, <span className="energy-text">then shows it.</span>
              </h2>
              <div className="mt-[2.4cqw] flex flex-col gap-[1.5cqw]">
                {[
                  ["Optimize", "Your share of a gauge is v/(V+v), so every extra vote earns a little less. Flywheel maximizes total rewards under your per-pool cap and minimum pool count, using water-filling, and benchmarks every plan against copying the crowd's split, going all-in, and splitting evenly."],
                  ["Price the boost", "Uses Mezo's boost formula to work out how much veMEZO lifts your power, and bids only when the boost is worth more than it costs. If nobody is bidding, it offers half the value."],
                  ["Explain", "Claude (claude-sonnet-5-5) writes the why in plain English. A guard rejects any explanation that quotes a number not in the plan, and a deterministic template steps in."],
                ].map(([t, d], i) => (
                  <div key={t} className="grid grid-cols-[3.6cqw_1fr] gap-[0.6cqw]">
                    <span className="s-idx pt-[0.4cqw]">{pad(i + 1)}</span>
                    <div>
                      <p className="s-h !text-[1.75cqw]">{t}</p>
                      <p className="s-body mt-[0.35cqw] !text-[1.25cqw]">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* the plan, rendered natively */}
            <div className="s-tile lg self-center !px-[2.4cqw] !py-[2cqw]" role="img" aria-label="Flywheel's plan for veBTC #1752: 60% to the Savings Vault, 40% to MUSD/BTC. Expected $15.97 against $7.62 for copying the crowd's split (+110%), on that epoch's live data. Written by claude-sonnet-5-5.">
              <div className="flex items-center justify-between gap-[1cqw]">
                <span className="s-chip">veBTC #1752</span>
                <span className="s-label !text-violet-hi">The plan</span>
              </div>
              <p className="mt-[1.4cqw] font-[family-name:var(--font-display)] text-[2.5cqw] font-bold uppercase leading-[1] tracking-[0.01em]">
                60% to the Savings Vault, <span className="energy-text">40% to MUSD/BTC</span>
              </p>
              <div className="s-sep mt-[1.5cqw]" />
              <p className="s-label mt-[1.2cqw]">Where the votes go</p>
              {[
                ["MUSD Savings Vault", 60],
                ["MUSD / BTC", 40],
              ].map(([k, v]) => (
                <div key={k} className="mt-[1.1cqw]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-[family-name:var(--font-display)] text-[1.35cqw] font-bold tracking-[0.03em]">{k}</span>
                    <span className="s-num !text-[2cqw]">{v}%</span>
                  </div>
                  <div className="s-ticks mt-[0.5cqw]" style={{ "--fill": `${v}%` } as CSSProperties} />
                </div>
              ))}
              <div className="s-sep mt-[1.5cqw]" />
              <div className="mt-[1.2cqw] grid grid-cols-[auto_1fr] items-end gap-[2cqw]">
                <div>
                  <p className="s-label">Expected</p>
                  <p className="s-num gold-text mt-[0.5cqw] !text-[4.4cqw]">$15.97</p>
                  <p className="mt-[0.5cqw] font-[family-name:var(--font-display)] text-[1.35cqw] font-bold tracking-[0.06em] text-ok">+110%</p>
                </div>
                <div className="flex flex-col gap-[0.9cqw] pb-[0.2cqw]">
                  <div>
                    <div className="flex justify-between font-[family-name:var(--font-display)] text-[1.05cqw] font-bold uppercase tracking-[0.06em]">
                      <span>Flywheel</span>
                      <span className="text-gold">$15.97</span>
                    </div>
                    <div className="s-stack mt-[0.35cqw] !h-[0.9cqw]">
                      <i className="s-fill-gold" style={{ flexBasis: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-[family-name:var(--font-display)] text-[1.05cqw] font-bold uppercase tracking-[0.06em] text-muted">
                      <span>Copying the crowd&apos;s split</span>
                      <span>$7.62</span>
                    </div>
                    <div className="s-stack mt-[0.35cqw] !h-[0.9cqw] bg-[rgb(167_139_250/0.1)]">
                      <i className="s-fill-faint" style={{ flexBasis: `${(7.62 / 15.97) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-[1.4cqw] flex items-center justify-between gap-[1cqw] border-t border-[rgb(167_139_250/0.14)] pt-[1.1cqw] text-[1cqw] text-muted">
                <span>On that epoch&apos;s live data</span>
                <span className="font-[family-name:var(--font-display)] font-semibold uppercase tracking-[0.14em] text-violet-hi">
                  written by <span className="normal-case">claude-sonnet-5-5</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <Foot n={4} />
      </section>

      {/* 5. Guardrails */}
      <section className="dark-island slide" aria-label="Non-custodial guardrails">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">Non-custodial by construction</p>
          <h2 className="s-title">
            Your <Ve>veBTC</Ve> never <span className="energy-text">leaves your wallet.</span>
          </h2>
          <p className="s-lede !mt-[1.4cqw] !max-w-[88cqw] !text-[1.45cqw]">
            You approve the contract on the NFT and enroll with a policy. FlywheelPilot checks it on every keeper call:
          </p>
          <div className="s-tile lg mt-[1.6cqw] !px-[2.4cqw] !py-[1.2cqw]">
            {[
              ["Most of your votes in any one pool", "vote reverts", "PoolShareTooHigh", ""],
              ["Spread across at least N pools", "vote reverts", "TooFewPools", ""],
              ["Pools you never want, or dead gauges", "vote reverts", "PoolNotAllowed", ""],
              ["Weekly MUSD reinvest budget", "compound reverts", "OverEpochCap", ""],
              ["Share of a compound that may buy boost", "compound reverts", "BoostShareTooHigh", ""],
              ["You sold or moved the NFT", "every action reverts", "OwnerChanged", ""],
              ["You want out", "", "exit()", " any time, or revoke the approval"],
            ].map(([a, verb, code, rest], i) => (
              <div key={a} className="s-row !grid-cols-[3cqw_36cqw_1fr] !py-[0.72cqw] !text-[1.3cqw] first:!border-t-0 last:!border-b-0">
                <span className="s-idx !text-[1.05cqw]">{pad(i + 1)}</span>
                <b>{a}</b>
                <span>
                  {verb && <>{verb} </>}
                  <code className={rest ? "good" : "bad"}>{code}</code>
                  {rest}
                </span>
              </div>
            ))}
          </div>
          <p className="s-body mt-[1.4cqw] !text-[1.25cqw]">
            Boost incentives only go to your own boost gauge. sMUSD only goes to you. The fee is capped at 10% in code.
          </p>
        </div>
        <Foot n={5} />
      </section>

      {/* 6. Live on testnet */}
      <section className="dark-island slide" aria-label="Live on Mezo testnet">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">Live on Mezo testnet</p>
          <h2 className="s-title">
            Deployed, verified, <span className="energy-text">already piloting.</span>
          </h2>
          <div className="s-grid-3 mt-[2cqw]">
            <div className="s-tile !py-[1.8cqw]">
              <p className="s-num !text-[5cqw]">2</p>
              <p className="s-h mt-[0.9cqw] !text-[1.5cqw]">
                demo <Ve>veBTC</Ve> piloted
              </p>
              <p className="s-body mt-[0.5cqw] !text-[1.2cqw]">Our own #1752 and #1753, owned by a wallet separate from the keeper, each under its own limits. No outside users yet.</p>
            </div>
            <div className="s-tile !py-[1.8cqw]">
              <p className="s-num !text-[5cqw]">2</p>
              <p className="s-h mt-[0.9cqw] !text-[1.5cqw]">plans published onchain</p>
              <p className="s-body mt-[0.5cqw] !text-[1.2cqw]">Each vote carries its full plan and reasoning in a PlanPublished event, read back by the app.</p>
            </div>
            <div className="s-tile gold !py-[1.8cqw]">
              <p className="s-num !text-[5cqw]">
                <span className="gold-text">160</span>
                <span className="s-unit">MUSD</span>
              </p>
              <p className="s-h mt-[0.9cqw] !text-[1.5cqw]">compounded</p>
              <p className="s-body mt-[0.5cqw] !text-[1.2cqw]">
                <span className="text-gold">120.65 sMUSD</span> to the owner, <span className="text-violet-hi">31.35 MUSD</span> of boost incentives on two new boost gauges,{" "}
                <span className="text-ink/80">8 MUSD</span> fee.
              </p>
              <div className="s-stack mt-[1cqw]" aria-hidden>
                <i className="s-fill-gold" style={{ flexBasis: `${(120.65 / 160) * 100}%` }} />
                <i className="s-fill-violet" style={{ flexBasis: `${(31.35 / 160) * 100}%` }} />
                <i className="s-fill-faint" style={{ flexBasis: `${(8 / 160) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-[1.8cqw] max-w-[88cqw]">
            {[
              ["FlywheelPilot (verified)", `${PILOT.slice(0, 10)}…${PILOT.slice(-6)}`, `${EXPLORER}/address/${PILOT}`],
              ["#1752 vote: 60% Savings Vault / 40% MUSD-BTC", "0x36e5ae…08dd20", `${EXPLORER}/tx/0x36e5ae6efd02e43972df4309ff64a0ff6bcd17a5a23765deea5920c5c308dd20`],
              ["#1752 compound: 100 MUSD", "0x4fedc1…0372c6", `${EXPLORER}/tx/0x4fedc1b2588c783ca7db5eb5ae8b18afe2bbab0cc6264586b8f2d3c3d06372c6`],
            ].map(([a, b, href], i) => (
              <div key={a} className="s-row !grid-cols-[3cqw_36cqw_1fr] !py-[0.6cqw]">
                <span className="s-idx !text-[1.05cqw]">{pad(i + 1)}</span>
                <b>{a}</b>
                <a className="s-link s-code" href={href}>
                  {b}
                </a>
              </div>
            ))}
          </div>
          <p className="s-body mt-[1cqw] !text-[1.25cqw]">
            On that epoch&apos;s live data, #1752&apos;s plan expected <span className="font-semibold text-gold">$15.97</span> against $7.62 for copying the crowd&apos;s split{" "}
            <span className="font-semibold text-ok">(+110%)</span>.
          </p>
        </div>
        <Foot n={6} />
      </section>

      {/* 7. Mainnet fork */}
      <section className="dark-island slide glow" aria-label="Proven against Mezo mainnet">
        <Frame />
        <div className="pointer-events-none absolute right-[5cqw] top-1/2 h-[32cqw] w-[32cqw] -translate-y-1/2" aria-hidden>
          <Rings className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="s-label !text-violet-hi">Mezo mainnet fork</p>
            <p className="s-num mt-[0.8cqw] !text-[2.6cqw]">13,202,859</p>
            <p className="s-label mt-[0.6cqw]">block</p>
            <span className="s-chip mt-[1.4cqw]">
              <Ve>veBTC</Ve> #5803
            </span>
          </div>
        </div>
        <div className="s-dots pointer-events-none absolute right-[6.5cqw] top-[9cqw] h-[5cqw] w-[9cqw] opacity-40" aria-hidden />
        <div className="slide-in justify-center">
          <p className="s-kicker">Proven against Mezo mainnet</p>
          <p className="s-num mt-[2cqw] !text-[11cqw] !leading-[0.85]">
            <span className="gold-text">21.0099</span>
            <span className="s-unit !text-[0.4em]">MUSD</span>
          </p>
          <p className="s-lede !mt-[2.4cqw] !max-w-[54cqw]">
            harvested by Flywheel for a real veBTC (#5803) on a fork of Mezo mainnet at block 13,202,859, one block before its owner claimed by hand. The exact amount Mezo owed lands in the owner&apos;s wallet. The contract keeps nothing.
          </p>
          <div className="s-sep mt-[2cqw] max-w-[54cqw]" />
          <p className="s-body mt-[1.6cqw] max-w-[54cqw]">
            The same fork pushes a capped 70/30 vote through the live mainnet PoolsVoter, and rejects the holder&apos;s real all-in vote under a 70% cap. 22 unit and fuzz tests, 3 testnet-fork and 2 mainnet-fork tests pass.
          </p>
        </div>
        <Foot n={7} />
      </section>

      {/* 8. Mezo integration */}
      <section className="dark-island slide" aria-label="Mezo integration">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">Built into Mezo, not beside it</p>
          <h2 className="s-title">
            Seven Mezo pieces, <span className="energy-text">one loop.</span>
          </h2>
          <div className="mt-[2.2cqw] max-w-[88cqw]">
            {[
              ["veBTC", "approval, ownership and power gate every action; power and lock feed the brain"],
              ["PoolsVoter", "vote with the plan's split; claimBribes and claimFees harvest; isAlive and lastVoted checks"],
              ["BoostVoter + boost gauge factory", "createBoostGauge for the veBTC, addBribes with MUSD, getBoost read back"],
              ["MUSD", "the compounding currency, with an owner allowance and a weekly cap"],
              ["MUSD Savings Vault (sMUSD)", "auto-save destination, and a votable gauge the brain often favours"],
              ["veMEZO", "total and per-gauge voting power priced into every boost decision"],
              ["Mezo Passport", "wallet connection in the app"],
            ].map(([a, b], i) => (
              <div key={a} className="s-row !grid-cols-[3cqw_24cqw_1fr] !py-[1.05cqw] !text-[1.34cqw]">
                <span className="s-idx !text-[1.1cqw]">{pad(i + 1)}</span>
                <b>{a}</b>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <Foot n={8} />
      </section>

      {/* 9. Business */}
      <section className="dark-island slide" aria-label="Business model">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">Business model</p>
          <h2 className="s-title !max-w-[82cqw]">
            Paid only when your money <span className="energy-text">goes back to work.</span>
          </h2>
          <div className="s-grid-3 mt-[2.2cqw] !grid-cols-[1fr_1fr_1.45fr]">
            <div className="s-tile gold !py-[1.9cqw]">
              <p className="s-num gold-text !text-[4.6cqw]">5%</p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">of compounded MUSD</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">Goes to the treasury and pays the keeper: gas, the model call, monitoring. Capped at 10% in code.</p>
            </div>
            <div className="s-tile !py-[1.9cqw]">
              <p className="s-num !text-[4.6cqw]">$0</p>
              <p className="s-h mt-[0.8cqw] !text-[1.5cqw]">to vote and harvest</p>
              <p className="s-body mt-[0.4cqw] !text-[1.2cqw]">A holder who only wants their votes cast well every week pays nothing.</p>
            </div>
            <div className="s-tile !py-[1.9cqw]">
              <p className="s-h !text-[1.5cqw]">Who it&apos;s for</p>
              <p className="s-body mt-[0.5cqw] !text-[1.2cqw]">
                veBTC holders who don&apos;t vote by hand every Thursday: small lockers who never vote, and larger holders who leave boost and idle MUSD on the table.
              </p>
              <p className="s-h mt-[1.1cqw] !text-[1.5cqw]">How we reach them</p>
              <p className="s-body mt-[0.5cqw] !text-[1.2cqw]">Mezo Earn&apos;s community, ecosystem partners, and a public onchain track record for every piloted veBTC.</p>
            </div>
          </div>
          <div className="mt-[2cqw]">
            <p className="s-lede !mt-0 !max-w-[88cqw] !text-[1.4cqw]">
              As it ran on testnet: #1752 compounded 100 MUSD. <span className="text-ink/90">5 MUSD</span> went to the treasury,{" "}
              <span className="text-violet-hi">22.8 MUSD</span> became boost incentives on its own boost gauge, and{" "}
              <span className="text-gold">72.2 MUSD</span> went into the Savings Vault as sMUSD for the owner.
            </p>
            <div className="s-stack mt-[1.2cqw]" aria-hidden>
              <i className="s-fill-gold" style={{ flexBasis: "72.2%" }} />
              <i className="s-fill-violet" style={{ flexBasis: "22.8%" }} />
              <i className="s-fill-faint" style={{ flexBasis: "5%" }} />
            </div>
          </div>
        </div>
        <Foot n={9} />
      </section>

      {/* 10. Roadmap + team */}
      <section className="dark-island slide glow" aria-label="Roadmap and team">
        <Frame />
        <div className="slide-in">
          <p className="s-kicker">What&apos;s next</p>
          <h2 className="s-title !max-w-[80cqw]">
            From testnet to <span className="energy-text">both sides of the boost market.</span>
          </h2>
          <div className="relative mt-[3cqw]">
            <div className="s-grid-3">
              {[
                ["Mainnet beta", "Audit FlywheelPilot, deploy on Mezo mainnet with a deposit cap, add a second keeper and Telegram alerts when a plan is published."],
                ["Boost market maker", "Pool boost bids across every Flywheel veBTC, and add a veMEZO autopilot that votes for the best boost incentives."],
                ["Managed veBTC", "Use Mezo managed locks so holders too small to justify gas can join a shared, Flywheel-piloted position."],
              ].map(([t, d], i) => (
                <div key={t} className={`s-tile ${i === 0 ? "gold" : ""}`}>
                  <div className="flex items-center gap-[0.8cqw]">
                    <span className="s-idx">{pad(i + 1)}</span>
                    <span className="h-px flex-1 bg-[rgb(167_139_250/0.2)]" />
                  </div>
                  <p className="s-h mt-[1.2cqw]">{caps(t)}</p>
                  <p className="s-body mt-[0.6cqw] !text-[1.2cqw]">{d}</p>
                </div>
              ))}
            </div>
            {/* connectors between the phases */}
            {["calc((100% - 3.2cqw) / 3 + 0.8cqw)", "calc((100% - 3.2cqw) * 2 / 3 + 2.4cqw)"].map((left) => (
              <span
                key={left}
                className="absolute top-1/2 h-[1.3cqw] w-[1.3cqw] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#b69cff] bg-[#0a0613] shadow-[0_0_1cqw_rgb(139_92_246/0.7)]"
                style={{ left }}
                aria-hidden
              />
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-[4cqw]">
            <div>
              <p className="s-label">Team</p>
              <p className="mt-[0.5cqw] font-[family-name:var(--font-display)] text-[1.8cqw] font-bold tracking-[0.02em]">0xdopewilly, solo: contracts, brain, keeper, frontend</p>
            </div>
            <div className="text-right text-[1.3cqw] leading-[1.6]">
              <p className="font-[family-name:var(--font-display)] text-[1.6cqw] font-bold tracking-[0.06em] text-gold">flywheel-mezo.vercel.app</p>
              <p className="text-muted">github.com/0xdopewilly/flywheel-mezo</p>
              <p className="text-muted">Video: youtu.be/35K6mhQ9tpU</p>
            </div>
          </div>
        </div>
        <Foot n={10} />
      </section>
    </main>
  );
}
