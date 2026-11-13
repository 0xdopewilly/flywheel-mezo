"use client";

import type { JournalResponse, MarketSnapshot, PlanResponse, PositionsResponse, RunResponse, UiPolicy } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
  /** The route is not deployed yet (or the server is down). */
  get unavailable() {
    return this.status === 404 || this.status === 0 || this.status === 502 || this.status === 503;
  }
}

async function request<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const { timeoutMs = 45_000, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(path, { ...rest, signal: rest.signal ?? AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const aborted = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
    throw new ApiError(aborted ? "The request took too long." : "Could not reach the Flywheel server.", 0);
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON: probably an HTML error page */
  }
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : null) ?? (res.status === 404 ? "This part of Flywheel is not live yet." : `The server answered ${res.status}.`);
    throw new ApiError(msg, res.status);
  }
  if (body === null) throw new ApiError("The server sent an empty answer.", res.status);
  return body as T;
}

export const api = {
  market: () => request<MarketSnapshot>("/api/market", { timeoutMs: 40_000 }),
  plan: (tokenId: string, p: UiPolicy, musd: number) =>
    request<PlanResponse>(`/api/plan?${planQuery(tokenId, p, musd)}`, { timeoutMs: 60_000 }),
  positions: (owner: string) => request<PositionsResponse>(`/api/positions?owner=${owner}`, { timeoutMs: 40_000 }),
  journal: (tokenId: string) => request<JournalResponse>(`/api/journal?tokenId=${tokenId}`, { timeoutMs: 40_000 }),
  run: (tokenId: string) =>
    request<RunResponse>("/api/pilot/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tokenId }),
      timeoutMs: 120_000,
    }),
};

export function planQuery(tokenId: string, p: UiPolicy, musd: number) {
  const q = new URLSearchParams({
    tokenId,
    cap: String(Math.round(p.cap * 100) / 100),
    minPools: String(p.minPools),
    boostShare: String(Math.round(p.boostShare * 100) / 100),
    autoSave: p.autoSave ? "1" : "0",
    musd: String(Math.max(0, Math.round(musd * 100) / 100)),
  });
  return q.toString();
}

// ---- tiny persistent cache so a returning visitor sees the last answer instantly ----

const PREFIX = "flywheel:cache:";

export function readCache<T>(key: string): { data: T; at: number } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; at: number };
    // Older than a day is not worth showing.
    if (!parsed || Date.now() - parsed.at > 24 * 3600 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, at: Date.now() }));
  } catch {
    /* storage full or blocked: fine */
  }
}
