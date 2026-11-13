"use client";

import { DEMO_TOKEN_ID, type UiPolicy } from "@/lib/ui/types";
import { AmountField, SliderField, StepperField, ToggleField } from "./Controls";
import { Shell } from "./EnablePanel";

/** One-click starting points, in plain words. Every field stays editable afterwards. */
export const PRESETS: { key: string; name: string; line: string; p: UiPolicy }[] = [
  { key: "safe", name: "Safe", line: "Spreads votes over 3+ gauges and saves most of the MUSD.", p: { cap: 0.4, minPools: 3, boostShare: 0.2, autoSave: true, pullCap: 50 } },
  { key: "balanced", name: "Balanced", line: "Leans into the best gauge, buys some boost, saves the rest.", p: { cap: 0.6, minPools: 2, boostShare: 0.3, autoSave: true, pullCap: 100 } },
  { key: "bold", name: "Bold", line: "Chases the top gauge and spends more on boost.", p: { cap: 0.9, minPools: 2, boostShare: 0.6, autoSave: true, pullCap: 200 } },
];

const same = (a: UiPolicy, b: UiPolicy) =>
  Math.abs(a.cap - b.cap) < 1e-9 && a.minPools === b.minPools && Math.abs(a.boostShare - b.boostShare) < 1e-9 && a.autoSave === b.autoSave && a.pullCap === b.pullCap;

export function PolicyPanel({
  policy,
  onChange,
  demo,
  dirty,
  onReset,
}: {
  policy: UiPolicy;
  onChange: (p: UiPolicy) => void;
  demo: boolean;
  dirty: boolean;
  onReset: () => void;
}) {
  const set = <K extends keyof UiPolicy>(k: K, v: UiPolicy[K]) => {
    const next = { ...policy, [k]: v };
    // The contract only allows "all to boost" when savings is off, so keep the two settings consistent.
    if (k === "autoSave" && v === false) next.boostShare = 1;
    if (k === "boostShare" && (v as number) < 1 && !policy.autoSave) next.autoSave = true;
    onChange(next);
  };
  const active = PRESETS.find((x) => same(x.p, policy))?.key;
  const floor = Math.ceil(1 / policy.cap - 1e-9);
  return (
    <Shell
      title="Your limits"
      right={
        dirty ? (
          <button type="button" onClick={onReset} className="focus-ring rounded-full px-2 py-1 text-[13.5px] font-medium text-muted hover:text-ink">
            Reset
          </button>
        ) : undefined
      }
    >
      <p className="pretty -mt-2 mb-5 text-[13.5px] leading-relaxed text-muted">
        {demo ? `Move anything and the brain re-plans veBTC #${DEMO_TOKEN_ID} live. Nothing is signed in demo mode.` : "Move anything and the brain re-plans live. The contract enforces what you save."}
      </p>
      <div className="mb-5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Start from a preset">
        {PRESETS.map((x) => {
          const on = active === x.key;
          return (
            <button
              key={x.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange({ ...x.p })}
              className={`border px-2 py-2.5 text-center transition-colors [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)] ${
                on ? "border-violet-hi bg-violet/20 text-ink shadow-[0_0_18px_-6px_rgba(139,92,246,0.8)]" : "border-line-strong text-muted hover:border-violet-hi/60 hover:text-ink"
              }`}
            >
              <span className="block font-[family-name:var(--font-display)] text-[15px] font-bold uppercase tracking-[0.1em]">{x.name}</span>
            </button>
          );
        })}
      </div>
      <p className="-mt-3 mb-4 min-h-[20px] text-[12.5px] leading-relaxed text-muted">
        {active ? PRESETS.find((x) => x.key === active)!.line : "Custom limits. Pick a preset to start over."}
      </p>
      <div className="divide-y divide-line">
        <SliderField
          label="Most in any one pool"
          value={Math.round(policy.cap * 100)}
          min={10}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => set("cap", v / 100)}
          help={
            floor > 1
              ? `No gauge gets more than this share of your votes, so they spread over at least ${floor} gauges.`
              : "No gauge gets more than this share of your votes."
          }
        />
        <StepperField
          label="Spread across at least"
          value={policy.minPools}
          min={1}
          max={10}
          unit={(v) => (v === 1 ? "pool" : "pools")}
          onChange={(v) => set("minPools", v)}
          help="The brain must vote at least this many gauges, even when one pays far more."
        />
        <SliderField
          label="MUSD that buys boost"
          value={Math.round(policy.boostShare * 100)}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => set("boostShare", v / 100)}
          help="The most of each reinvestment the brain may offer as incentives on your own boost gauge. Those incentives are paid to the veMEZO holders who vote for your boost (they don’t come back to you); in return your voting power rises, up to 5×. If nobody is voting boosts, the brain doesn’t bid."
        />
        <ToggleField
          label="Save the rest in the MUSD Savings Vault"
          value={policy.autoSave}
          onChange={(v) => set("autoSave", v)}
          help={
            policy.autoSave
              ? "Whatever doesn’t buy boost is deposited for you, and the sMUSD is sent to your wallet."
              : "Savings is off, so every reinvestment goes to boost (the contract requires it). Turn it back on to save part of it."
          }
        />
        <AmountField
          label="Weekly reinvest budget (MUSD)"
          value={policy.pullCap}
          onChange={(v) => set("pullCap", v)}
          suffix="MUSD"
          help={
            <>
              The most MUSD the brain may move from your wallet each week, only into your Savings Vault (sMUSD comes back to you) or your own boost
              gauge.
              {demo && <span className="mt-1.5 block text-ink/70">In demo mode the brain plans as if this budget is available.</span>}
            </>
          }
        />
      </div>
    </Shell>
  );
}
