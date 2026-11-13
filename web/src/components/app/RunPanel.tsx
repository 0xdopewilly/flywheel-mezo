"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { Address } from "viem";
import { useWriteContract } from "wagmi";
import { api } from "@/lib/ui/api";
import { pilotAbi } from "@/lib/mezo/pilotAbi";
import { PILOT_ADDRESS, txUrl } from "@/lib/mezo/chain";
import type { RunAction } from "@/lib/ui/types";
import { FlywheelMark } from "@/components/brand/FlywheelMark";
import { STATION_ICONS } from "@/components/brand/StationIcons";
import { ExternalArrow } from "@/components/site/Nav";
import { Shell } from "./EnablePanel";
import { useTx } from "./useTx";
import { MEZO_TESTNET_ID } from "./wagmi";

const EASE = [0.16, 1, 0.3, 1] as const;

const KIND: Record<RunAction["kind"], { label: string; icon: number | null }> = {
  vote: { label: "Voted", icon: 0 },
  harvest: { label: "Harvested", icon: 1 },
  compound: { label: "Compounded", icon: 2 },
  skip: { label: "Skipped", icon: null },
};

/** "Let the brain act now", its receipts, and the exit door. */
export function RunPanel({ tokenId, live, onExited }: { tokenId: string; live: boolean; onExited: () => void }) {
  const qc = useQueryClient();
  const run = useMutation({
    mutationFn: () => api.run(tokenId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal", tokenId] });
      qc.invalidateQueries({ queryKey: ["plan", tokenId] });
    },
  });
  const [confirming, setConfirming] = useState(false);

  return (
    <Shell
      title="Let the brain act now"
      right={
        <button type="button" onClick={() => setConfirming(true)} className="focus-ring rounded-full px-2 py-1 text-[13.5px] font-medium text-muted transition-colors hover:text-red">
          Exit autopilot
        </button>
      }
    >
      <p className="pretty text-[14px] leading-relaxed text-muted">
        The keeper runs every epoch on its own. You can also ask it to plan and act right away: vote, harvest what is claimable, and reinvest within your
        budget. Each step is re-checked by the contract.
      </p>
      <button type="button" className="btn btn-ink mt-5 w-full sm:w-auto" disabled={!live || run.isPending} onClick={() => run.mutate()}>
        {run.isPending ? (
          <>
            <FlywheelMark size={20} spinning className="text-[#fff]" /> The brain is working…
          </>
        ) : (
          "Run the brain now"
        )}
      </button>
      {!live && <p className="mt-2 text-[13px] text-muted">The autopilot is paused, usually because the veBTC approval was revoked.</p>}

      <AnimatePresence initial={false}>
        {run.isPending && (
          <motion.p key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-[13.5px] text-muted">
            Reading Mezo, planning, then sending each transaction. This can take up to a minute.
          </motion.p>
        )}
        {run.error && (
          <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-[13.5px] text-red">
            {(run.error as Error).message}
          </motion.p>
        )}
        {run.data && (
          <motion.ul
            key="d"
            className="mt-5 flex flex-col gap-2"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
          >
            {run.data.actions.map((a, i) => (
              <ActionRow key={i} a={a} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <ExitDialog open={confirming} tokenId={tokenId} onClose={() => setConfirming(false)} onExited={onExited} />
    </Shell>
  );
}

function ActionRow({ a }: { a: RunAction }) {
  const k = KIND[a.kind];
  const Icon = k.icon === null ? null : STATION_ICONS[k.icon];
  return (
    <motion.li
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
      className="flex items-start gap-3 rounded-[3px] bg-paper p-3.5"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${a.kind === "skip" ? "bg-ink/10 text-ink/60" : "bg-ink text-white"}`}>
        {Icon ? <Icon size={16} /> : <span className="h-[2px] w-3 rounded bg-current" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{k.label}</p>
        <p className="pretty mt-0.5 text-[13.5px] leading-relaxed text-muted">{a.reason}</p>
        {a.tx && (
          <a href={txUrl(a.tx)} target="_blank" rel="noreferrer" className="link-underline mt-1 inline-flex items-center gap-1 text-[13px] font-medium">
            {a.tx.slice(0, 10)}…{a.tx.slice(-6)} <ExternalArrow />
          </a>
        )}
      </div>
    </motion.li>
  );
}

function ExitDialog({ open, tokenId, onClose, onExited }: { open: boolean; tokenId: string; onClose: () => void; onExited: () => void }) {
  const { writeContractAsync } = useWriteContract();
  const tx = useTx();
  const busy = tx.state.status === "signing" || tx.state.status === "mining";
  if (typeof document === "undefined") return null;
  // (cast: @types/react-dom resolves a newer ReactNode than @types/react 18 here)
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-[3px] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !busy && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            className="w-full max-w-[440px] rounded-[3px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] sm:p-7"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="exit-title" className="text-[21px] font-semibold tracking-[-0.02em]">
              Stop the autopilot for veBTC #{tokenId}?
            </h3>
            <p className="pretty mt-3 text-[15px] leading-relaxed text-muted">
              The brain stops voting, harvesting and reinvesting for it. Your current votes stay until you change them, and the NFT never left your
              wallet. You can also revoke the approval afterwards.
            </p>
            {tx.state.status !== "idle" && (
              <p className={`mt-4 text-[14px] ${tx.state.status === "error" ? "text-red" : "text-ink/80"}`}>
                {tx.state.status === "signing" && "Confirm in your wallet…"}
                {tx.state.status === "mining" && "Waiting for Mezo to confirm…"}
                {tx.state.status === "error" && tx.state.error}
                {tx.state.status === "done" && "Autopilot stopped."}
                {tx.state.hash && (
                  <a href={txUrl(tx.state.hash)} target="_blank" rel="noreferrer" className="link-underline ml-2 inline-flex items-center gap-1 font-medium text-ink">
                    View <ExternalArrow />
                  </a>
                )}
              </p>
            )}
            <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
                Keep it running
              </button>
              <button
                type="button"
                className="btn bg-red text-[#fff] hover:brightness-110"
                disabled={busy || !PILOT_ADDRESS}
                onClick={async () => {
                  const ok = await tx.run(() =>
                    writeContractAsync({ chainId: MEZO_TESTNET_ID, address: PILOT_ADDRESS as Address, abi: pilotAbi, functionName: "exit", args: [BigInt(tokenId)] }),
                  );
                  if (ok) {
                    onExited();
                    setTimeout(onClose, 900);
                  }
                }}
              >
                {busy ? <FlywheelMark size={20} spinning className="text-[#fff]" /> : null}
                Exit autopilot
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  ) as unknown as React.ReactElement;
}
