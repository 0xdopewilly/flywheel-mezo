"use client";

import { api } from "@/lib/ui/api";
import { useCachedQuery } from "@/lib/ui/hooks";
import { fmtUsd, fmtVe } from "@/lib/ui/format";
import { Loader } from "@/components/brand/FlywheelMark";
import { CountUp } from "@/components/motion/CountUp";

/** The live inputs to the boost formula, read from Mezo testnet. */
export function BoostLive() {
  const q = useCachedQuery(["market"], api.market, { refetchInterval: 90_000 });
  const b = q.data?.boost;
  if (!b) {
    return q.error ? (
      <p className="text-[14px] text-muted">Live boost numbers are unavailable right now.</p>
    ) : (
      <Loader label="Reading the boost market on Mezo…" />
    );
  }
  const items = [
    { k: "All veBTC voting power", v: <CountUp value={b.veBtcTotalUnboosted} format={(x) => `${fmtVe(x)} veBTC`} />, tone: "text-gold" },
    { k: "All veMEZO voting power", v: <CountUp value={b.veMezoTotal} format={(x) => `${Math.round(x).toLocaleString("en-US")}`} />, tone: "text-ink" },
    {
      k: "What boost gauges pay per veMEZO vote",
      v: b.usdPerVeMezo > 0 ? <span>{fmtUsd(b.usdPerVeMezo)}</span> : <span>Nothing yet</span>,
      tone: b.usdPerVeMezo > 0 ? "text-gold" : "text-violet-hi",
      note:
        b.usdPerVeMezo > 0
          ? `median of ${b.sampled} paying boost gauge${b.sampled === 1 ? "" : "s"}`
          : "so Flywheel bids half of what the boost is worth",
    },
  ];
  return (
    <dl className="grid gap-px bg-line sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.k} className="bg-[#0f0820] px-4 py-4 sm:px-5">
          <dt className="text-[12.5px] leading-snug text-muted">{it.k}</dt>
          <dd className={`hud-num mt-2 text-[26px] leading-none ${it.tone}`}>{it.v}</dd>
          {it.note && <dd className="mt-2 text-[12.5px] leading-snug text-faint">{it.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
