"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient, keepPreviousData, type QueryKey } from "@tanstack/react-query";
import { readCache, writeCache } from "./api";

/** Seconds since epoch, ticking. Null until mounted so server and client render the same markup. */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now() / 1000);
    const id = setInterval(() => setNow(Date.now() / 1000), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useDebounced<T>(value: T, ms = 450): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/**
 * React Query plus a localStorage echo: the last good answer for this key is shown at once (marked
 * as cached) while a fresh one loads. Previous data stays on screen while a new key loads.
 */
export function useCachedQuery<T>(key: QueryKey, fn: () => Promise<T>, opts?: { enabled?: boolean; staleTime?: number; refetchInterval?: number }) {
  const qc = useQueryClient();
  const cacheKey = JSON.stringify(key);
  const seeded = useRef<string | null>(null);

  useEffect(() => {
    if (seeded.current === cacheKey) return;
    seeded.current = cacheKey;
    if (qc.getQueryData(key)) return;
    const hit = readCache<T>(cacheKey);
    // Seed with an old timestamp so the query still fetches fresh data.
    if (hit) qc.setQueryData(key, hit.data, { updatedAt: hit.at });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await fn();
      writeCache(cacheKey, data);
      return data;
    },
    enabled: opts?.enabled ?? true,
    staleTime: opts?.staleTime ?? 60_000,
    refetchInterval: opts?.refetchInterval,
    placeholderData: keepPreviousData,
    retry: (count, err) => count < 1 && !(err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404),
  });
  return q;
}

export function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const on = () => setR(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return r;
}
