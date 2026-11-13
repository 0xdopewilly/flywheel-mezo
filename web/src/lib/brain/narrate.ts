import type { PlanCore } from "./plan";

export type Narrative = { headline: string; why: string; model: string };

const SYSTEM = `You are the strategist inside Flywheel, an autopilot for Mezo veBTC positions.
Each epoch you vote a veBTC across Mezo Earn gauges, and may reinvest MUSD into the veBTC's boost gauge
or the MUSD Savings Vault. Explain this epoch's decision to the position's owner.

Rules:
- Use only numbers that appear in the plan JSON. Never invent figures, APRs or forecasts.
- Plain, confident English. No hype, no emoji, no jargon like "KKT" or "lambda".
- Say where the votes go and why (rewards per vote versus how crowded each gauge is).
- Compare with simply following the crowd, using the baseline numbers and edgePct.
- Boost reasons: "bid_half_value" means nobody is paying veMEZO voters this epoch, so Flywheel bids half
  of what the extra boost is worth; "profitable" means the market price makes boosting pay; "not_worth_it",
  "no_budget" and "at_max" mean no boost spend.
- Say what happens to boost and savings this epoch, and why.
- headline: at most 12 words. why: at most 90 words.
Reply with JSON only: {"headline": "...", "why": "..."}`;

export async function narrate(core: PlanCore): Promise<Narrative> {
  const key = process.env.NEARAI_API_KEY;
  if (key) {
    for (const model of ["anthropic/claude-sonnet-5-5", "anthropic/claude-haiku-5-5"]) {
      try {
        const r = await fetch("https://cloud-api.near.ai/v1/chat/completions", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            max_tokens: 400,
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: JSON.stringify(core) },
            ],
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!r.ok) continue;
        const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
        const text = j.choices?.[0]?.message?.content ?? "";
        const m = text.match(/\{[\s\S]*\}/);
        if (!m) continue;
        const parsed = JSON.parse(m[0]) as { headline?: string; why?: string };
        if (parsed.headline && parsed.why && groundedNumbers(parsed.headline + " " + parsed.why, core)) {
          return { headline: parsed.headline.trim(), why: parsed.why.trim(), model };
        }
      } catch {
        /* try the next model, then the template */
      }
    }
  }
  return { ...template(core), model: "template" };
}

/** Rejects a narrative that quotes a number the plan does not contain (a cheap hallucination guard). */
function groundedNumbers(text: string, core: PlanCore): boolean {
  const haystack = JSON.stringify(core);
  const known = new Set<string>();
  for (const m of haystack.matchAll(/-?\d+(?:\.\d+)?/g)) {
    const v = Number(m[0]);
    known.add(String(v));
    for (const d of [0, 1, 2]) known.add(v.toFixed(d));
    known.add(String(Math.round(v)));
  }
  for (const m of text.replace(/(\d),(?=\d{3}\b)/g, "$1").matchAll(/\d+(?:\.\d+)?/g)) {
    const t = m[0];
    const v = Number(t);
    if (v <= 10) continue; // small counts ("3 gauges", "5x") are fine
    if (![...known].some((k) => Math.abs(Number(k) - v) <= Math.max(0.011, Math.abs(v) * 0.006))) return false;
  }
  return true;
}

const money = (v: number) => (v >= 100 ? `$${v.toFixed(0)}` : v >= 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(3)}`);

export function template(core: PlanCore): { headline: string; why: string } {
  const top = [...core.votes].sort((a, b) => b.pct - a.pct);
  const lead = top[0];
  const spread = top.length > 1 ? `, then ${top.slice(1, 3).map((v) => `${v.pct}% to ${v.label}`).join(" and ")}` : "";
  const vsCrowd = core.edgePct.vsCrowd;
  const boostLine =
    core.boost.spendUsd > 0
      ? core.boost.reason === "bid_half_value"
        ? `Nobody is paying veMEZO voters this epoch, so it bids ${money(core.boost.spendUsd)} on your boost gauge, half of what lifting your power from ${core.boost.from}x to ${core.boost.to}x is worth.`
        : `It also posts ${money(core.boost.spendUsd)} of boost incentives to lift voting power from ${core.boost.from}x to ${core.boost.to}x.`
      : core.boost.reason === "not_worth_it"
        ? "Boost is skipped: the extra rewards would not cover the incentives this epoch."
        : "No boost this epoch.";
  return {
    headline: lead ? `${lead.pct}% to ${lead.label}, ${money(core.expectedUsd)} expected this epoch` : "Holding this epoch",
    why: lead
      ? `${lead.pct}% goes to ${lead.label}${spread}, where rewards per vote are highest once crowding is counted. Expected: ${money(core.expectedUsd)} versus ${money(core.baselines.followCrowd)} for following the crowd (${vsCrowd >= 0 ? "+" : ""}${vsCrowd}%). ${boostLine}`
      : "No gauge pays enough to vote this epoch.",
  };
}
