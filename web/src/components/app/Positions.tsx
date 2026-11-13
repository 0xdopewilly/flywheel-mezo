"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/ui/api";
import { txUrl } from "@/lib/mezo/chain";
import { DEMO_TOKEN_ID, type Position } from "@/lib/ui/types";
import { fmtDay, fmtMult, fmtVe } from "@/lib/ui/format";
import { ErrorState } from "@/components/site/States";
import { FlywheelMark, Loader } from "@/components/brand/FlywheelMark";
import { Shell } from "./EnablePanel";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Positions({
  positions,
  loading,
  error,
  onRetry,
  selected,
  onSelect,
  onPreviewDemo,
  owner,
  onFunded,
}: {
  positions?: Position[];
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  selected: string | null;
  onSelect: (id: string) => void;
  onPreviewDemo: () => void;
  owner?: string;
  onFunded?: (tokenId: string) => void;
}) {
  return (
    <Shell title="Your veBTC" right={loading && positions ? <Loader size={18} /> : undefined}>
      {!positions && loading ? (
        <div className="flex flex-col gap-3">
          <Loader label="Looking for veBTC in this wallet…" />
          <div className="shimmer h-[76px] rounded-[3px]" />
        </div>
      ) : !positions && error ? (
        <ErrorState title="Couldn’t read your veBTC" detail={(error as Error).message} onRetry={onRetry} />
      ) : positions && positions.length === 0 ? (
        <div>
          <p className="text-[15px] font-semibold">No veBTC in this wallet on Mezo testnet</p>
          <p className="pretty mt-1.5 text-[14px] leading-relaxed text-muted">
            Get a small test veBTC from Flywheel’s faucet to try the whole flow, or lock test BTC in Mezo Earn. Until then, the brain’s plan for veBTC
            #{DEMO_TOKEN_ID} is shown read-only.
          </p>
          {owner && <FaucetClaim owner={owner} onFunded={onFunded} />}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="https://testnet.mezo.org" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              Lock BTC on Mezo
            </a>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onPreviewDemo}>
              Keep previewing #{DEMO_TOKEN_ID}
            </button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Choose a veBTC">
          {positions?.map((p, i) => {
            const on = p.tokenId === selected;
            return (
              <motion.li key={p.tokenId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(p.tokenId)}
                  className={`focus-ring w-full rounded-[3px] p-4 text-left transition-[background-color,box-shadow] duration-300 ${
                    on ? "bg-violet/15 shadow-[inset_0_0_0_1px_#B69CFF,0_0_24px_-6px_rgba(139,92,246,0.7)]" : "bg-paper hover:bg-paper-deep"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[16px] font-semibold tracking-[-0.015em]">veBTC #{p.tokenId}</span>
                    <StatusChip p={p} />
                  </div>
                  <p className="tnum mt-1.5 text-[13px] leading-relaxed text-muted">
                    {fmtVe(p.power)} veBTC of votes, {fmtMult(p.boost)} boost, {p.permanent ? "permanent lock" : `unlocks ${fmtDay(p.lockEnd)}`}
                  </p>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}

function StatusChip({ p }: { p: Position }) {
  if (p.enrolled && p.live) return <span className="rounded-full bg-lime px-2.5 py-0.5 text-[12px] font-semibold">On autopilot</span>;
  if (p.enrolled) return <span className="rounded-full bg-sand px-2.5 py-0.5 text-[12px] font-semibold">Paused</span>;
  return <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[12px] font-medium text-muted">Not enrolled</span>;
}

/** Testnet only: a small veBTC locked straight into this wallet, plus gas and MUSD, so anyone can try every step. */
function FaucetClaim({ owner, onFunded }: { owner: string; onFunded?: (tokenId: string) => void }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [tx, setTx] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let on = true;
    api
      .faucetStatus()
      .then((s) => on && setAvailable(s.available))
      .catch(() => on && setAvailable(false));
    return () => {
      on = false;
    };
  }, []);
  if (available === false && state === "idle") return null;
  return (
    <div className="mt-4 rounded-[3px] bg-paper p-4">
      {state === "done" ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <p className="text-[14.5px] font-semibold">{msg}</p>
          {tx && (
            <a href={txUrl(tx)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[13px] text-muted underline decoration-red/40 underline-offset-2">
              See the lock on Mezo’s explorer
            </a>
          )}
        </motion.div>
      ) : (
        <>
          <p className="text-[14.5px] font-semibold">Try it with a test veBTC</p>
          <p className="pretty mt-1 text-[13.5px] leading-relaxed text-muted">
            0.0008 test BTC locked for 4 weeks, straight into your wallet, plus a little BTC for gas and 15 MUSD to reinvest. Testnet only.
          </p>
          <button
            type="button"
            className="btn btn-ink btn-sm mt-3"
            disabled={state === "busy" || available === null}
            onClick={async () => {
              setState("busy");
              setMsg("");
              try {
                const r = await api.faucet(owner);
                setTx(r.lockTx);
                setMsg(`veBTC #${r.tokenId} is in your wallet${Number(r.musd) > 0 ? `, with ${r.musd} MUSD` : ""}. Pick it below to put it on autopilot.`);
                setState("done");
                onFunded?.(r.tokenId);
              } catch (e) {
                setMsg((e as Error).message);
                setState("error");
              }
            }}
          >
            {state === "busy" ? (
              <>
                <FlywheelMark size={16} spinning className="text-[#fff]" /> Locking test BTC…
              </>
            ) : (
              "Get a test veBTC"
            )}
          </button>
          {state === "error" && <p className="mt-2 text-[13px] text-red">{msg}</p>}
        </>
      )}
    </div>
  );
}
