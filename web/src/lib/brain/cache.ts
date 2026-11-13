import "server-only";

type Entry<T> = { at: number; value: Promise<T> };
const store = new Map<string, Entry<unknown>>();

/** Small in-memory memo with a TTL. Concurrent callers share one in-flight promise. */
export function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const value = fn().catch((e) => {
    store.delete(key);
    throw e;
  });
  store.set(key, { at: Date.now(), value });
  if (store.size > 500) {
    const oldest = [...store.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
    for (const [k] of oldest) store.delete(k);
  }
  return value;
}

export function invalidate(prefix: string) {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
