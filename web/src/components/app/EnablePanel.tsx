"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, type ReactNode } from "react";
import { parseUnits, type Address } from "viem";
import { useReadContracts, useWriteContract } from "wagmi";
import { erc20Abi, veAbi } from "@/lib/mezo/abis";
import { pilotAbi } from "@/lib/mezo/pilotAbi";
import { MEZO, PILOT_ADDRESS, txUrl } from "@/lib/mezo/chain";
import type { UiPolicy } from "@/lib/ui/types";
import { FlywheelMark } from "@/components/brand/FlywheelMark";
import { ExternalArrow } from "@/components/site/Nav";
import { useTx, type TxState } from "./useTx";
import { MEZO_TESTNET_ID } from "./wagmi";

const EASE = [0.16, 1, 0.3, 1] as const;

export function toChainPolicy(p: UiPolicy) {
  return {
    maxPoolShareBps: Math.round(p.cap * 10_000),
    boostShareBps: Math.round(p.boostShare * 10_000),
    minPools: p.minPools,
    autoSave: p.autoSave,
    epochPullCap: parseUnits(String(Math.max(0, Math.round(p.pullCap * 100) / 100)), 18),
  };
}

export type PilotStatus = { enrolled: boolean; approved: boolean; live: boolean; policyMatches: boolean; musdOk: boolean };

export function EnablePanel({
  tokenId,
  owner,
  policy,
  onStatus,
  onEnrolled,
}: {
  tokenId: string;
  owner: Address;
  policy: UiPolicy;
  onStatus?: (s: PilotStatus) => void;
  onEnrolled?: () => void;
}) {
  const pilot = PILOT_ADDRESS as Address | "";
  const id = BigInt(tokenId);
  const reads = useReadContracts({
    allowFailure: true,
    query: { enabled: !!pilot, refetchInterval: 20_000 },
    contracts: pilot
      ? [
          { chainId: MEZO_TESTNET_ID, address: MEZO.veBTC, abi: veAbi, functionName: "getApproved", args: [id] },
          { chainId: MEZO_TESTNET_ID, address: MEZO.veBTC, abi: veAbi, functionName: "isApprovedForAll", args: [owner, pilot] },
          { chainId: MEZO_TESTNET_ID, address: MEZO.musd, abi: erc20Abi, functionName: "allowance", args: [owner, pilot] },
          { chainId: MEZO_TESTNET_ID, address: pilot, abi: pilotAbi, functionName: "enrollment", args: [id] },
          { chainId: MEZO_TESTNET_ID, address: pilot, abi: pilotAbi, functionName: "isLive", args: [id] },
          { chainId: MEZO_TESTNET_ID, address: pilot, abi: pilotAbi, functionName: "feeBps" },
        ]
      : [],
  });

  const r = reads.data;
  const approvedTo = r?.[0]?.result as Address | undefined;
  const approvedAll = r?.[1]?.result as boolean | undefined;
  const allowance = (r?.[2]?.result as bigint | undefined) ?? 0n;
  const enrollment = r?.[3]?.result as
    | { owner: Address; active: boolean; policy: { maxPoolShareBps: number; boostShareBps: number; minPools: number; autoSave: boolean; epochPullCap: bigint } }
    | undefined;
  const live = Boolean(r?.[4]?.result);
  const feeBps = r?.[5]?.result as number | undefined;

  const chainPolicy = useMemo(() => toChainPolicy(policy), [policy]);
  const approved = !!pilot && (approvedAll === true || (approvedTo?.toLowerCase() === pilot.toLowerCase()));
  const enrolled = !!enrollment?.active && enrollment.owner.toLowerCase() === owner.toLowerCase();
  const policyMatches =
    enrolled &&
    enrollment!.policy.maxPoolShareBps === chainPolicy.maxPoolShareBps &&
    enrollment!.policy.boostShareBps === chainPolicy.boostShareBps &&
    enrollment!.policy.minPools === chainPolicy.minPools &&
    enrollment!.policy.autoSave === chainPolicy.autoSave &&
    enrollment!.policy.epochPullCap === chainPolicy.epochPullCap;
  // The allowance covers several weeks of budget; the contract still pulls at most one budget per epoch.
  const musdOk = chainPolicy.epochPullCap === 0n || allowance >= chainPolicy.epochPullCap;
  const weeksLeft = chainPolicy.epochPullCap === 0n ? 0 : Number(allowance / chainPolicy.epochPullCap);
  const allowanceTarget = chainPolicy.epochPullCap * BigInt(BUDGET_WEEKS);

  useEffect(() => {
    onStatus?.({ enrolled, approved, live, policyMatches, musdOk });
  }, [enrolled, approved, live, policyMatches, musdOk, onStatus]);

  const { writeContractAsync } = useWriteContract();
  const approveTx = useTx();
  const enrollTx = useTx();
  const musdTx = useTx();

  const refresh = () => reads.refetch();

  if (!pilot) {
    return (
      <Shell title="Put it on autopilot">
        <div className="rounded-[3px] bg-sand/70 p-4 text-[14px] leading-relaxed text-ink/80">
          The Flywheel contract is on its way to Mezo testnet. Enabling opens here the moment it’s live. Until then, every limit above already
          re-plans the brain live.
        </div>
        <Steps>
          <Step n={1} title="Let Flywheel vote this veBTC" desc={`Approves the Flywheel contract on veBTC #${tokenId}. The NFT stays in your wallet.`} state="locked" />
          <Step n={2} title="Save your limits on-chain" desc="Enrolls it with the limits above. The contract rejects any plan outside them." state="locked" />
          <Step n={3} title="Allow the reinvest budget" desc="Optional. Lets the brain move up to your weekly budget into savings or boost." state="locked" />
        </Steps>
      </Shell>
    );
  }

  return (
    <Shell title={enrolled ? "On autopilot" : "Put it on autopilot"} badge={enrolled ? (live ? "Running" : "Paused") : undefined}>
      <Steps>
        <Step
          n={1}
          title="Let Flywheel vote this veBTC"
          desc={`Approves the Flywheel contract on veBTC #${tokenId}. The NFT stays in your wallet.`}
          state={approved ? "done" : "ready"}
          tx={approveTx.state}
          action={
            <button
              type="button"
              className="btn btn-ink btn-sm"
              disabled={approveTx.state.status === "signing" || approveTx.state.status === "mining"}
              onClick={async () => {
                const ok = await approveTx.run(() =>
                  writeContractAsync({ chainId: MEZO_TESTNET_ID, address: MEZO.veBTC, abi: veAbi, functionName: "approve", args: [pilot, id] }),
                );
                if (ok) refresh();
              }}
            >
              Approve
            </button>
          }
        />
        <Step
          n={2}
          title={enrolled && !policyMatches ? "Save your new limits" : "Save your limits on-chain"}
          desc={
            enrolled && !policyMatches
              ? "Your limits above differ from the ones on-chain. Save them and the next run follows them."
              : "Enrolls it with the limits above. The contract rejects any plan outside them."
          }
          state={!approved && !enrolled ? "locked" : enrolled && policyMatches ? "done" : "ready"}
          tx={enrollTx.state}
          action={
            <button
              type="button"
              className="btn btn-ink btn-sm"
              disabled={enrollTx.state.status === "signing" || enrollTx.state.status === "mining"}
              onClick={async () => {
                const ok = await enrollTx.run(() =>
                  writeContractAsync({
                    chainId: MEZO_TESTNET_ID,
                    address: pilot,
                    abi: pilotAbi,
                    functionName: enrolled ? "updatePolicy" : "enroll",
                    args: [id, chainPolicy],
                  }),
                );
                if (ok) {
                  refresh();
                  if (!enrolled) onEnrolled?.();
                }
              }}
            >
              {enrolled ? "Update limits" : "Turn on autopilot"}
            </button>
          }
        />
        <Step
          n={3}
          optional
          title={musdOk && allowance > 0n ? `Reinvest budget: ${weeksLeft >= BUDGET_WEEKS ? BUDGET_WEEKS : weeksLeft} week${weeksLeft === 1 ? "" : "s"} allowed` : `Allow ${fmtMusd(policy.pullCap)} MUSD a week`}
          desc={
            musdOk && allowance > 0n
              ? `MUSD allowance left: ${fmtMusd(Number(allowance) / 1e18)}. The contract still never pulls more than ${fmtMusd(policy.pullCap)} MUSD in a week, and only into your Savings Vault or your own boost gauge.${weeksLeft <= 2 ? " Top it up soon so reinvesting doesn’t pause." : ""}`
              : allowance > 0n
                ? `Only ${fmtMusd(Number(allowance) / 1e18)} MUSD of allowance is left, less than one week’s budget, so reinvesting is paused. Top it up for another ${BUDGET_WEEKS} weeks.`
                : `Lets the brain use up to ${fmtMusd(policy.pullCap)} MUSD from your wallet each week for ${BUDGET_WEEKS} weeks (${fmtMusd(policy.pullCap * BUDGET_WEEKS)} MUSD allowance). The contract enforces the weekly limit, and the MUSD only goes to your Savings Vault or your own boost gauge.`
          }
          state={chainPolicy.epochPullCap === 0n ? "skipped" : musdOk && weeksLeft > 2 ? "done" : "ready"}
          tx={musdTx.state}
          action={
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={musdTx.state.status === "signing" || musdTx.state.status === "mining"}
              onClick={async () => {
                const ok = await musdTx.run(() =>
                  writeContractAsync({
                    chainId: MEZO_TESTNET_ID,
                    address: MEZO.musd,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [pilot, allowanceTarget],
                  }),
                );
                if (ok) refresh();
              }}
            >
              {allowance > 0n ? "Top up" : "Approve"}
            </button>
          }
        />
      </Steps>
      {feeBps !== undefined && (
        <p className="mt-5 text-[13px] leading-relaxed text-muted">
          Flywheel keeps {(feeBps / 100).toLocaleString("en-US")}% of the MUSD it reinvests, and nothing else. The contract caps that fee at 10%.
        </p>
      )}
    </Shell>
  );
}

const fmtMusd = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** How many weeks of reinvest budget one MUSD approval covers. */
export const BUDGET_WEEKS = 12;

export function Shell({ title, badge, children, right }: { title: string; badge?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-[family-name:var(--font-display)] text-[20px] font-bold uppercase tracking-[0.08em]">
            {title.split("veBTC").map((part, k, all) => (
              <span key={k}>
                {part}
                {k < all.length - 1 && (
                  <>
                    <span className="normal-case">ve</span>BTC
                  </>
                )}
              </span>
            ))}
          </h2>
          {badge && (
            <span
              className={`flex items-center gap-1.5 border px-2.5 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] ${
                badge === "Running" ? "border-ok/40 text-ok" : "border-gold/40 text-gold"
              }`}
            >
              <span className={`h-1.5 w-1.5 ${badge === "Running" ? "hud-pulse bg-ok" : "bg-gold"}`} />
              {badge}
            </span>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="relative flex flex-col gap-2">{children}</ol>;
}

type StepState = "locked" | "ready" | "done" | "skipped";

function Step({
  n,
  title,
  desc,
  state,
  tx,
  action,
  optional,
}: {
  n: number;
  title: string;
  desc: string;
  state: StepState;
  tx?: TxState;
  action?: ReactNode;
  optional?: boolean;
}) {
  const busy = tx?.status === "signing" || tx?.status === "mining";
  const done = state === "done" || tx?.status === "done";
  return (
    <li className={`rounded-[3px] p-4 transition-colors duration-500 ${done ? "bg-lime/70" : state === "ready" ? "bg-paper" : "bg-paper/50"}`}>
      <div className="flex gap-3.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center">
          <AnimatePresence mode="wait" initial={false}>
            {busy ? (
              <motion.span key="b" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                <FlywheelMark size={26} spinning className="text-ink" />
              </motion.span>
            ) : done ? (
              <motion.svg key="d" width="26" height="26" viewBox="0 0 26 26" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 26 }} aria-label="Done">
                <circle cx="13" cy="13" r="12" fill="#3EE0A1" />
                <motion.path d="m8 13.4 3.3 3.2 6.7-7.1" fill="none" stroke="#07040D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
              </motion.svg>
            ) : (
              <motion.span
                key="n"
                className={`tnum grid h-[26px] w-[26px] place-items-center rounded-full text-[13px] font-semibold ${state === "ready" ? "bg-ink text-white" : "bg-ink/10 text-ink/50"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {n}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className={`text-[15px] font-semibold tracking-[-0.01em] ${state === "locked" ? "text-ink/50" : ""}`}>{title}</p>
            {optional && <span className="text-[12.5px] text-muted">optional</span>}
          </div>
          <p className={`pretty mt-1 text-[13.5px] leading-relaxed ${state === "locked" ? "text-ink/40" : "text-muted"}`}>{desc}</p>
          <AnimatePresence initial={false}>
            {tx && tx.status !== "idle" && tx.status !== "done" && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`text-[13px] ${tx.status === "error" ? "text-red" : "text-ink/80"}`}
              >
                <span className="block pt-2">
                  {tx.status === "signing" && "Confirm in your wallet…"}
                  {tx.status === "mining" && "Waiting for Mezo to confirm…"}
                  {tx.status === "error" && tx.error}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
          {tx?.hash && (
            <a href={txUrl(tx.hash)} target="_blank" rel="noreferrer" className="link-underline mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium">
              View transaction <ExternalArrow />
            </a>
          )}
          {state === "skipped" && <p className="mt-1 text-[13px] text-muted">Set a weekly reinvest budget above to use this.</p>}
          {state === "ready" && !done && action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </li>
  );
}
