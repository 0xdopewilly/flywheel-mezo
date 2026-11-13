"use client";

import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";

function Field({ label, value, help, children, htmlFor }: { label: string; value?: ReactNode; help?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="text-[15px] font-semibold tracking-[-0.01em]">
          {label}
        </label>
        {value !== undefined && <span className="tnum text-[20px] font-semibold tracking-[-0.025em]">{value}</span>}
      </div>
      <div className="mt-2.5">{children}</div>
      {help && <p className="pretty mt-2 text-[13.5px] leading-relaxed text-muted">{help}</p>}
    </div>
  );
}

export function SliderField({
  label,
  help,
  value,
  min,
  max,
  step,
  onChange,
  format,
  disabled,
}: {
  label: string;
  help?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  disabled?: boolean;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <Field label={label} value={format(value)} help={help} htmlFor={id}>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--pct" as string]: `${pct}%`, opacity: disabled ? 0.4 : 1 }}
        aria-valuetext={format(value)}
      />
      <div className="tnum mt-0.5 flex justify-between text-[12px] text-faint" aria-hidden>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </Field>
  );
}

export function StepperField({
  label,
  help,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  label: string;
  help?: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit: (v: number) => string;
}) {
  return (
    <Field label={label} help={help}>
      <div className="flex items-center gap-3">
        <StepButton label="Fewer" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          <path d="M5 10h10" />
        </StepButton>
        <div className="relative h-11 min-w-[112px] flex-1 overflow-hidden rounded-full bg-paper text-center">
          <motion.span
            key={value}
            className="tnum absolute inset-0 grid place-items-center text-[16px] font-semibold"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            aria-live="polite"
          >
            {value} {unit(value)}
          </motion.span>
        </div>
        <StepButton label="More" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          <path d="M5 10h10M10 5v10" />
        </StepButton>
      </div>
    </Field>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="btn grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper p-0 hover:bg-paper-deep"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

export function ToggleField({ label, help, value, onChange }: { label: string; help?: ReactNode; value: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="cursor-pointer text-[15px] font-semibold tracking-[-0.01em]">
          {label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`focus-ring relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors duration-300 ${value ? "bg-violet shadow-[0_0_14px_rgba(139,92,246,0.6)]" : "bg-ink/15"}`}
        >
          <motion.span
            className="absolute left-[3px] top-[3px] h-6 w-6 rounded-full bg-[#fff] shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
            animate={{ x: value ? 22 : 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
          />
        </button>
      </div>
      {help && <p className="pretty mt-2 text-[13.5px] leading-relaxed text-muted">{help}</p>}
    </div>
  );
}

export function AmountField({
  label,
  help,
  value,
  onChange,
  suffix,
}: {
  label: string;
  help?: ReactNode;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  const id = useId();
  return (
    <Field label={label} help={help} htmlFor={id}>
      <div className="flex h-12 items-center rounded-[3px] bg-paper px-4 focus-within:ring-2 focus-within:ring-red/30">
        <input
          id={id}
          inputMode="decimal"
          className="tnum w-full bg-transparent text-[18px] font-semibold tracking-[-0.02em] outline-none"
          value={Number.isFinite(value) ? String(value) : ""}
          onChange={(e) => {
            const v = Number(e.target.value.replace(/[^0-9.]/g, ""));
            onChange(Number.isFinite(v) ? Math.min(v, 1_000_000_000) : 0);
          }}
        />
        <span className="ml-2 shrink-0 text-[14px] font-medium text-muted">{suffix}</span>
      </div>
    </Field>
  );
}
