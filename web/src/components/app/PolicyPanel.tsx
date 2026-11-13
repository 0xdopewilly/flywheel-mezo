"use client";

import type { UiPolicy } from "@/lib/ui/types";
import { AmountField, SliderField, StepperField, ToggleField } from "./Controls";
import { Shell } from "./EnablePanel";

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
  const set = <K extends keyof UiPolicy>(k: K, v: UiPolicy[K]) => onChange({ ...policy, [k]: v });
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
        {demo ? "Move anything and the brain re-plans veBTC #1742 live. Nothing is signed in demo mode." : "Move anything and the brain re-plans live. The contract enforces what you save."}
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
          help="The most of each reinvestment that may go to incentives on your own boost gauge, attracting veMEZO votes that lift your voting power up to 5×."
        />
        <ToggleField
          label="Save the rest in the MUSD Savings Vault"
          value={policy.autoSave}
          onChange={(v) => set("autoSave", v)}
          help={
            policy.autoSave
              ? "Whatever doesn’t buy boost is deposited for you, and the sMUSD is sent to your wallet."
              : "Savings is off, so the brain only reinvests when all of it goes to boost."
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
