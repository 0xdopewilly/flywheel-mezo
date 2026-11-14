"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/ui/api";
import { useCachedQuery, useDebounced, useTwoPhasePlan } from "@/lib/ui/hooks";
import { DEFAULT_UI_POLICY, DEMO_TOKEN_ID, type Position, type PositionPolicy, type UiPolicy } from "@/lib/ui/types";
import { fmtEpoch } from "@/lib/ui/format";
import { erc20Abi } from "@/lib/mezo/abis";
import { MEZO } from "@/lib/mezo/chain";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PlanCard } from "@/components/plan/PlanCard";
import { Countdown } from "@/components/plan/Countdown";
import { Journal } from "@/components/plan/Journal";
import { GaugeTable } from "@/components/plan/GaugeTable";
import { FastForward } from "@/components/plan/FastForward";
import { FlywheelMark } from "@/components/brand/FlywheelMark";
import { ConnectPill } from "./ConnectPill";
import { Positions } from "./Positions";
import { PolicyPanel } from "./PolicyPanel";
import { EnablePanel, type PilotStatus } from "./EnablePanel";
import { RunPanel } from "./RunPanel";
import { Mission } from "./Mission";
import { MEZO_TESTNET_ID } from "./wagmi";

const EASE = [0.16, 1, 0.3, 1] as const;

function fromPositionPolicy(p: PositionPolicy | undefined): UiPolicy | null {
  if (!p) return null;
  const bps = (v: unknown) => (v === undefined || v === null ? undefined : Number(v));
  const cap = bps(p.maxPoolShareBps) !== undefined ? bps(p.maxPoolShareBps)! / 10_000 : p.capPct !== undefined ? p.capPct / 100 : undefined;
  const boost = bps(p.boostShareBps) !== undefined ? bps(p.boostShareBps)! / 10_000 : p.boostSharePct !== undefined ? p.boostSharePct / 100 : undefined;
  if (cap === undefined || boost === undefined) return null;
  return {
    cap: Math.min(1, Math.max(0.1, cap)),
    boostShare: Math.min(1, Math.max(0, boost)),
    minPools: Math.max(1, Number(p.minPools ?? 1)),
    autoSave: p.autoSave ?? true,
    pullCap: Number(p.epochPullCap ?? 0) || 0,
  };
}

const samePolicy = (a: UiPolicy, b: UiPolicy) =>
  a.cap === b.cap && a.minPools === b.minPools && a.boostShare === b.boostShare && a.autoSave === b.autoSave && a.pullCap === b.pullCap;

export function AppScreen() {
  const { address, isConnected, chainId } = useAccount();
  const qc = useQueryClient();

  const positionsQ = useCachedQuery(["positions", address], () => api.positions(address!), { enabled: !!address, refetchInterval: 30_000, staleTime: 15_000 });
  const positions: Position[] | undefined = address ? positionsQ.data?.positions : undefined;

  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (!positions?.length) return;
    if (!selected || !positions.some((p) => p.tokenId === selected)) setSelected(positions[0].tokenId);
  }, [positions, selected]);
  useEffect(() => {
    if (!isConnected) setSelected(null);
  }, [isConnected]);

  const demo = !isConnected || !positions?.length || !selected;
  const tokenId = demo ? DEMO_TOKEN_ID : selected!;
  const position = positions?.find((p) => p.tokenId === tokenId);

  // policy: the saved one for an enrolled veBTC, otherwise sensible defaults
  const saved = useMemo(() => fromPositionPolicy(position?.policy) ?? DEFAULT_UI_POLICY, [position?.policy]);
  const [policy, setPolicy] = useState<UiPolicy>(DEFAULT_UI_POLICY);
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    const key = `${tokenId}:${position?.enrolled ? "e" : "n"}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setPolicy(saved);
  }, [tokenId, position?.enrolled, saved]);
  const debounced = useDebounced(policy, 550);

  const bal = useReadContract({
    chainId: MEZO_TESTNET_ID,
    address: MEZO.musd,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !demo, refetchInterval: 30_000 },
  });
  const musdBalance = bal.data !== undefined ? Number(formatUnits(bal.data as bigint, 18)) : 0;
  const musd = demo ? debounced.pullCap : Math.min(debounced.pullCap, musdBalance);
  const musdKey = Math.floor(musd * 100) / 100;

  const planQ = useTwoPhasePlan(
    ["plan", tokenId, debounced, musdKey],
    () => api.plan(tokenId, debounced, musdKey, true),
    () => api.plan(tokenId, debounced, musdKey),
    { staleTime: 60_000 },
  );

  const [pilot, setPilot] = useState<PilotStatus | null>(null);
  const onStatus = useCallback((s: PilotStatus) => setPilot(s), []);
  useEffect(() => setPilot(null), [tokenId]);

  const refreshPositions = () => qc.invalidateQueries({ queryKey: ["positions", address] });

  // one-click test veBTC from the mission panel (the same faucet as the card in "Your veBTC")
  const [claim, setClaim] = useState<{ busy: boolean; msg?: string; ok?: boolean }>({ busy: false });
  const doClaim = async () => {
    if (!address || claim.busy) return;
    setClaim({ busy: true });
    try {
      const r = await api.faucet(address);
      setClaim({ busy: false, ok: true, msg: `veBTC #${r.tokenId} is in your wallet${Number(r.musd) > 0 ? `, with ${r.musd} MUSD and gas` : ""}.` });
      setSelected(r.tokenId);
      refreshPositions();
      setTimeout(refreshPositions, 4000);
    } catch (e) {
      setClaim({ busy: false, ok: false, msg: (e as Error).message });
    }
  };
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const wrongChain = isConnected && chainId !== MEZO_TESTNET_ID;
  const market = planQ.data?.market;

  // the newcomer's mission: every step checked from live state
  const gas = useBalance({ chainId: MEZO_TESTNET_ID, address, query: { enabled: !!address, refetchInterval: 30_000 } });
  const journalQ = useCachedQuery(["journal", tokenId], () => api.journal(tokenId), { enabled: !demo, refetchInterval: 60_000, staleTime: 20_000 });
  const enrolledNow = pilot?.enrolled ?? position?.enrolled ?? false;
  const liveNow = pilot?.live ?? position?.live ?? false;
  const mission = {
    connected: isConnected,
    wrongChain,
    hasVeBTC: !!positions?.length,
    loadingPositions: positionsQ.isFetching && !positions,
    gasLow: gas.data !== undefined && gas.data.value < 10_000_000_000_000n,
    enrolled: !demo && enrolledNow,
    armed: !demo && enrolledNow && liveNow,
    musdBudgetOk: pilot?.musdOk ?? true,
    hasRun: !demo && (journalQ.data?.entries?.length ?? 0) > 0,
    tokenId: demo ? undefined : tokenId,
  };

  return (
    <>
      <Nav right={<ConnectPill />} />
      <main className="shell pb-6 pt-6 md:pt-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={demo ? "demo" : "mine"}
                className="display balance text-[clamp(40px,5.4vw,72px)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {demo ? (
                  <>
                    Watch the brain <span className="serif-accent energy-text">think.</span>
                  </>
                ) : (
                  <>
                    Your <span className="normal-case">ve</span>BTC, <span className="serif-accent energy-text">at work.</span>
                  </>
                )}
              </motion.h1>
            </AnimatePresence>
            <p className="pretty mt-4 max-w-[600px] text-[16.5px] leading-relaxed text-ink/70">
              {!isConnected
                ? `No wallet connected, so this is the live plan for veBTC #${DEMO_TOKEN_ID}, a real position Flywheel pilots on Mezo testnet. Connect a wallet to put your own veBTC on autopilot.`
                : demo
                  ? `This wallet has no veBTC yet, so this is the live plan for veBTC #${DEMO_TOKEN_ID}, read-only.`
                  : `Pick a veBTC, set its limits, and turn on the autopilot. The plan below is computed live for veBTC #${tokenId}.`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1 md:items-end md:text-right">
            <p className="text-[13.5px] text-muted">{market ? `Epoch from ${fmtEpoch(market.epoch)}, voting closes in` : "Voting closes in"}</p>
            <p className="text-[26px] font-semibold leading-none tracking-[-0.03em]">
              {market ? <Countdown to={market.voteClosesAt} seconds={false} /> : <span className="shimmer inline-block h-7 w-36 rounded-[3px]" />}
            </p>
          </div>
        </header>

        <Mission s={mission} onConnect={() => openConnectModal?.()} onSwitchChain={() => openChainModal?.()} onClaim={doClaim} claim={claim} />

        <AnimatePresence>
          {wrongChain && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[3px] bg-blush px-5 py-4">
              <p className="text-[14.5px] font-medium">Your wallet is on another network. Flywheel runs on Mezo testnet.</p>
              <ConnectPill />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid gap-5 md:mt-12 lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-6">
          <div id="positions" className="scroll-mt-24 lg:col-start-1 lg:row-start-1">
            {isConnected ? (
              <Positions
                positions={positions}
                loading={positionsQ.isFetching}
                error={positionsQ.error}
                onRetry={() => positionsQ.refetch()}
                selected={selected}
                onSelect={setSelected}
                onPreviewDemo={() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                owner={address}
                onFunded={(id) => {
                  setSelected(id);
                  refreshPositions();
                  setTimeout(refreshPositions, 4000);
                }}
              />
            ) : (
              <DemoCard onConnect={() => openConnectModal?.()} />
            )}
          </div>

          <div id="limits" className="scroll-mt-24 lg:col-start-1 lg:row-start-2">
            <PolicyPanel policy={policy} onChange={setPolicy} demo={demo} dirty={!samePolicy(policy, saved)} onReset={() => setPolicy(saved)} />
          </div>

          <div id="plan" className="flex scroll-mt-24 flex-col gap-5 self-start lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:gap-6">
            <PlanCard
              tokenId={tokenId}
              data={planQ.data}
              error={planQ.error}
              isFetching={planQ.refreshing}
              narrating={planQ.narrating}
              onRetry={() => planQ.refetch()}
            />
            <GaugeTable plan={planQ.data?.plan} />
            {planQ.data && <FastForward plan={planQ.data.plan} budget={debounced.pullCap} startMusd={demo ? debounced.pullCap : musdBalance} />}
          </div>

          {!demo && address && (
            <div className="flex flex-col gap-5 self-start lg:col-start-1 lg:row-start-3 lg:gap-6">
              <div id="enable" className="scroll-mt-24">
                <EnablePanel tokenId={tokenId} owner={address} policy={policy} onStatus={onStatus} onEnrolled={refreshPositions} />
              </div>
              <AnimatePresence>
                {(pilot?.enrolled || position?.enrolled) && (
                  <motion.div id="run" className="scroll-mt-24" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                    <RunPanel
                      tokenId={tokenId}
                      live={pilot?.live ?? position?.live ?? false}
                      onExited={refreshPositions}
                      unsaved={!!pilot && pilot.enrolled && !pilot.policyMatches}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <Journal tokenId={tokenId} />
      </main>
      <ReplanPill fetching={planQ.refreshing} headline={planQ.data?.plan.narrative.headline} />
      <Footer />
    </>
  );
}

function DemoCard({ onConnect }: { onConnect: () => void }) {
  return (
    <section className="hud hud-lg relative overflow-hidden p-6 sm:p-7" style={{ boxShadow: "inset 0 0 60px rgba(139,92,246,0.18)" }}>
      <div className="dots pointer-events-none absolute right-5 top-5 h-[46px] w-[46px] opacity-50" aria-hidden />
      <p className="eyebrow flex items-center gap-2">
        <span className="hud-pulse h-1.5 w-1.5 bg-ok" /> Demo mode · read-only
      </p>
      <h2 className="display mt-3 text-[38px] leading-none">
        <span className="normal-case">ve</span>BTC <span className="gold-text">#{DEMO_TOKEN_ID}</span>
      </h2>
      <p className="pretty mt-3 text-[14px] leading-relaxed text-muted">
        A real position Flywheel pilots on Mezo testnet. It came from the app’s test faucet, the same way yours can. The journal below is read straight
        from the chain. Move the limits and watch the plan change.
      </p>
      <button type="button" onClick={onConnect} className="btn btn-ink btn-sm mt-5">
        Connect wallet
      </button>
    </section>
  );
}

/** Phones only: the plan sits below the limits, so say when the brain has re-planned and offer a jump. */
function ReplanPill({ fetching, headline }: { fetching: boolean; headline?: string }) {
  const [show, setShow] = useState<"busy" | "done" | null>(null);
  const was = useRef(false);
  useEffect(() => {
    if (fetching) {
      was.current = true;
      setShow("busy");
      return;
    }
    if (!was.current) return;
    was.current = false;
    setShow("done");
    const t = setTimeout(() => setShow(null), 3200);
    return () => clearTimeout(t);
  }, [fetching]);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="fixed bottom-5 left-4 right-4 z-40 flex items-center gap-3 rounded-full bg-ink py-2.5 pl-3 pr-5 text-left text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)] lg:hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10">
            <FlywheelMark size={20} spinning={show === "busy"} className="text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold">{show === "busy" ? "Re-planning with your limits…" : "New plan ready"}</span>
            {show === "done" && headline && <span className="block truncate text-[12.5px] text-white/60">{headline}</span>}
          </span>
          {show === "done" && <span className="text-[13px] font-semibold">See it</span>}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
