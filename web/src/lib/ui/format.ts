const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtUsd(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "–";
  const a = Math.abs(v);
  if (a === 0) return "$0";
  if (a < 0.01) return v < 0 ? "−<$0.01" : "<$0.01";
  if (a >= 10_000) return usd0.format(v);
  return usd2.format(v);
}

/** Compact dollars for big headline numbers. */
export function fmtUsdCompact(v: number): string {
  if (!Number.isFinite(v)) return "–";
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 10_000) return `$${(v / 1_000).toFixed(1)}k`;
  return fmtUsd(v);
}

/** veBTC amounts span 1e-4 .. 1e2; keep three significant digits below 1. */
export function fmtVe(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "–";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 100) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (a >= 1) return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (a < 0.00001) return "<0.00001";
  return Number(v.toPrecision(3)).toString();
}

export function fmtPct(v: number, digits = 0): string {
  if (!Number.isFinite(v)) return "–";
  return `${v.toFixed(digits)}%`;
}

export function fmtSignedPct(v: number): string {
  if (!Number.isFinite(v)) return "–";
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}%`;
}

export function fmtMult(v: number): string {
  return `${v.toFixed(2)}×`;
}

export function shortHex(h: string, head = 6, tail = 4): string {
  if (!h) return "";
  if (h.length <= head + tail + 1) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

export function splitCountdown(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  hour12: false,
});
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export const fmtEpoch = (unix: number) => dateFmt.format(new Date(unix * 1000));
export const fmtDateTime = (unix: number) => `${dateTimeFmt.format(new Date(unix * 1000))} UTC`;
export const fmtDay = (unix: number) => dayFmt.format(new Date(unix * 1000));

/** "anthropic/claude-sonnet-5-5" -> "claude-sonnet-5-5"; "template" -> null (show nothing) */
export function modelName(model: string | undefined): string | null {
  if (!model || model === "template") return null;
  return model.split("/").pop() ?? model;
}

export const BOOST_REASON: Record<string, string> = {
  profitable: "Boost pays for itself at today’s veMEZO price.",
  bid_half_value: "Nobody is paying veMEZO voters this week, so Flywheel bids half of what the extra boost is worth to you.",
  not_worth_it: "Boost would cost more than it earns this week.",
  no_budget: "Set a reinvest budget to let the brain buy boost.",
  at_max: "Already at the 5× maximum.",
};
