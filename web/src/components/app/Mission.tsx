"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNow } from "@/lib/ui/hooks";

const EASE = [0.16, 1, 0.3, 1] as const;
const WEEK = 7 * 24 * 3600;
const DAY = 24 * 3600;

export type MissionState = {
  connected: boolean;
  wrongChain: boolean;
  hasVeBTC: boolean;
  loadingPositions: boolean;
  gasLow: boolean;
  enrolled: boolean;
  armed: boolean;
  musdBudgetOk: boolean;
  hasRun: boolean;
  tokenId?: string;
};

type Step = {
  key: string;
  label: string;
  title: string;
  body: string;
  sign?: string;
  safe?: string;
  cta?: { label: string; onClick?: () => void; busy?: boolean };
  note?: string;
};

/** Keep "veBTC" lowercase-v inside uppercase type. */
function Ve({ text }: { text: string }) {
  const parts = text.split("veBTC");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <>
              <span className="normal-case">ve</span>BTC
            </>
          )}
        </span>
      ))}
    </>
  );
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.animate?.([{ boxShadow: "0 0 0 2px rgba(182,156,255,0.9)" }, { boxShadow: "0 0 0 2px rgba(182,156,255,0)" }], { duration: 1600, easing: "ease-out" });
};

/**
 * The newcomer's quest log: five steps from "no wallet" to "autopilot armed", each checked off from live wallet
 * state, with what to do, what you will sign and what cannot happen. Collapses to a status line when done.
 */
export function Mission({
  s,
  onConnect,
  onSwitchChain,
  onClaim,
  claim,
}: {
  s: MissionState;
  onConnect: () => void;
  onSwitchChain: () => void;
  onClaim: () => void;
  claim: { busy: boolean; msg?: string; ok?: boolean };
}) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem("fw:mission-hidden") === "1");
    } catch {
      /* private mode */
    }
  }, []);
  const toggle = () => {
    setHidden((h) => {
      try {
        localStorage.setItem("fw:mission-hidden", h ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !h;
    });
  };

  const steps: Step[] = [
    {
      key: "connect",
      label: "Connect",
      title: s.wrongChain ? "Switch your wallet to Mezo testnet" : "Connect a wallet",
      body: s.wrongChain
        ? "Flywheel runs on Mezo testnet (chain 31611). Your wallet is on another network, so nothing here would work yet. One click switches it."
        : "Pick OKX Wallet, MetaMask, Rabby or any EVM wallet. You don’t need any crypto: this is Mezo testnet, and the app hands you everything you need. Your wallet will be asked to add and switch to Mezo testnet; approve that.",
      sign: s.wrongChain ? "A network switch. No transaction, no cost." : "Nothing. Connecting only shares your address.",
      cta: s.wrongChain ? { label: "Switch network", onClick: onSwitchChain } : { label: "Connect wallet", onClick: onConnect },
    },
    {
      key: "vebtc",
      label: "Get veBTC",
      title: "Get a veBTC to pilot",
      body: "A veBTC is BTC locked in Mezo Earn. It comes as an NFT that holds voting power, and voting is what earns it rewards each week. No veBTC yet? Click “Get a test veBTC” and Flywheel’s testnet faucet locks a little test BTC into one, straight into your wallet, with gas and 15 MUSD included.",
      sign: "Nothing. The faucet sends it to you.",
      safe: "Testnet only. These tokens have no real value.",
      cta: { label: claim.busy ? "Locking test BTC… (about 30 s)" : "Get a test veBTC", onClick: onClaim, busy: claim.busy },
      note: claim.msg,
    },
    {
      key: "limits",
      label: "Pick limits",
      title: "Pick your limits",
      body: "Limits are the rules the autopilot must follow: the most of your votes any one pool can get, how many pools to spread across, how much MUSD it may reinvest each week, and how much of that may buy boost. Not sure? Start with the Balanced preset. The plan on the right re-computes as you move anything.",
      sign: "Nothing yet. Limits are saved onchain in the next step.",
      cta: { label: "Go to limits", onClick: () => scrollTo("limits") },
    },
    {
      key: "arm",
      label: "Arm it",
      title: "Arm the autopilot",
      body: "Three quick signatures: (1) let Flywheel’s contract vote this veBTC, (2) save your limits onchain, (3) optionally allow a weekly MUSD reinvest budget. The contract checks every future action against what you sign here.",
      sign: "An NFT approval, an enroll transaction, and an optional MUSD allowance. Gas on testnet costs fractions of a cent.",
      safe: "Your veBTC never leaves your wallet. Rewards are paid by Mezo straight to you. Flywheel can’t withdraw, transfer or sell anything.",
      cta: { label: "Arm it", onClick: () => scrollTo("enable") },
    },
    {
      key: "run",
      label: "First run",
      title: "Watch the first run",
      body: "The keeper runs on its own every day at 20:00 UTC, and casts the week’s vote late (from Tuesday evening), once incentives are known. Or press “Run the brain now” to see it act right away: it votes inside your limits, publishes its plan and reasoning onchain, and reinvests your MUSD budget. The result appears in the journal at the bottom of this page.",
      sign: "Nothing. The keeper pays the gas.",
      cta: { label: "Go to run", onClick: () => scrollTo("run") },
    },
  ];

  const done = [s.connected && !s.wrongChain, s.hasVeBTC, s.enrolled, s.armed, s.hasRun];
  const current = done.findIndex((d) => !d);
  const allDone = current === -1;
  const progress = done.filter(Boolean).length;
  const step = allDone ? null : steps[current];

  return (
    <section className="hud glass mt-8 overflow-hidden md:mt-10" aria-labelledby="mission-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="hud-num text-[12px] uppercase tracking-[0.22em] text-gold">Mission</span>
          <h2 id="mission-title" className="font-[family-name:var(--font-display)] text-[18px] font-bold uppercase tracking-[0.08em]">
            {allDone ? "Autopilot armed" : (
              <>
                Put your <span className="normal-case">ve</span>BTC on autopilot
              </>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hud-num text-[14px] text-muted">
            <span className="text-ink">{progress}</span> / 5
          </span>
          <Link href="/guide" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold hover:text-gold-hi">
            New here? Read the guide
          </Link>
          <button type="button" onClick={toggle} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink">
            {hidden ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!hidden && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            {/* quest track */}
            <ol className="grid grid-cols-5 gap-1.5 px-5 pt-5 sm:gap-2 sm:px-7">
              {steps.map((st, i) => {
                const isDone = done[i];
                const isCur = i === current;
                return (
                  <li key={st.key} className="min-w-0">
                    <div
                      className={`h-2 transition-colors duration-500 ${isDone ? "bg-violet-hi shadow-[0_0_10px_rgba(182,156,255,0.6)]" : isCur ? "bg-gold" : "bg-violet/15"}`}
                    />
                    <p className={`mt-2 truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] sm:text-[11.5px] ${isCur ? "text-gold" : isDone ? "text-ink" : "text-faint"}`}>
                      <span className="hud-num mr-1">{isDone ? "✓" : `0${i + 1}`}</span>
                      <span className="hidden sm:inline">
                        <Ve text={st.label} />
                      </span>
                    </p>
                  </li>
                );
              })}
            </ol>

            <div className="px-5 pb-6 pt-5 sm:px-7">
              <AnimatePresence mode="wait">
                {step ? (
                  <motion.div key={step.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }} className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
                    <div>
                      <p className="eyebrow !text-gold">Step 0{current + 1} · now</p>
                      <h3 className="display mt-1.5 text-[26px] leading-none sm:text-[30px]">
                        <Ve text={step.title} />
                      </h3>
                      <p className="pretty mt-3 max-w-[640px] text-[14.5px] leading-[1.65] text-ink/80">{step.body}</p>
                      {step.cta && (
                        <button type="button" onClick={step.cta.onClick} disabled={step.cta.busy} className="btn btn-ink btn-sm mt-4">
                          <Ve text={step.cta.label} />
                        </button>
                      )}
                      {step.note && <p className={`mt-3 text-[13.5px] ${claim.ok ? "text-ok" : "text-red"}`}>{step.note}</p>}
                    </div>
                    <dl className="flex flex-col gap-3 self-start border-l border-line pl-5 text-[13.5px] leading-relaxed">
                      {step.sign && (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-hi">What you sign</dt>
                          <dd className="mt-0.5 text-muted">{step.sign}</dd>
                        </div>
                      )}
                      {step.safe && (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ok">What can’t happen</dt>
                          <dd className="mt-0.5 text-muted">{step.safe}</dd>
                        </div>
                      )}
                      {s.connected && !s.wrongChain && s.gasLow && (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red">Heads up: no gas</dt>
                          <dd className="mt-0.5 text-muted">
                            This wallet has no test BTC to pay for signatures. The test veBTC comes with gas, or grab some at{" "}
                            <a href="https://faucet.test.mezo.org" target="_blank" rel="noreferrer" className="text-ink underline decoration-violet-hi/50 underline-offset-2">
                              faucet.test.mezo.org
                            </a>
                            .
                          </dd>
                        </div>
                      )}
                    </dl>
                  </motion.div>
                ) : (
                  <motion.div key="armed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                    <NextUp tokenId={s.tokenId} musdBudgetOk={s.musdBudgetOk} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** What happens next, in UTC, once everything is armed. */
function NextUp({ tokenId, musdBudgetOk }: { tokenId?: string; musdBudgetOk: boolean }) {
  const now = useNow(60_000);
  if (now === null) return null;
  const epoch = now - (now % WEEK);
  const nextEpoch = epoch + WEEK;
  const nextRun = (() => {
    const today = now - (now % DAY) + 20 * 3600;
    return today > now ? today : today + DAY;
  })();
  const fmt = (t: number) =>
    new Date(t * 1000).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC", hour12: false }) + " UTC";
  const items = [
    { k: "Next keeper run", v: fmt(nextRun), d: "Every day at 20:00 UTC: it harvests and reinvests, and casts the week’s single vote late (from Tuesday), once incentives are known." },
    { k: "This vote’s rewards", v: `from ${fmt(nextEpoch)}`, d: "Incentives and fees for this epoch’s vote become claimable when the epoch ends. The keeper harvests them to your wallet." },
    { k: "Reinvesting", v: musdBudgetOk ? "On" : "Paused", d: musdBudgetOk ? "Up to your weekly budget goes to your boost gauge and the Savings Vault." : "No MUSD allowance left. Top it up in the autopilot panel to keep compounding." },
    { k: "Want out?", v: "Any time", d: "Press “Exit autopilot”, and revoke the NFT approval in your wallet for good measure." },
  ];
  return (
    <div>
      <p className="eyebrow !text-ok flex items-center gap-2">
        <span className="hud-pulse h-1.5 w-1.5 bg-ok" /> <span className="normal-case">ve</span>BTC #{tokenId} is flying itself
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k} className="border-l border-line pl-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-hi">{it.k}</dt>
            <dd className="hud-num mt-1 text-[19px] text-ink">{it.v}</dd>
            <dd className="mt-1 text-[13px] leading-relaxed text-muted">{it.d}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
