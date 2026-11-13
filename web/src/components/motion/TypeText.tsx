"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Text that "types in" like the brain is speaking: quick, never slow (whole paragraph in ~1.6 s).
 * The untyped remainder is laid out invisibly, so nothing below it jumps.
 */
export function TypeText({ text, className, maxSeconds = 1.6 }: { text: string; className?: string; maxSeconds?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setN(text.length);
      setDone(true);
      return;
    }
    setDone(false);
    setN(0);
    const cps = Math.max(110, text.length / maxSeconds);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(text.length, Math.floor(((t - t0) / 1000) * cps));
      setN(k);
      if (k < text.length) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 900);
    };
    raf = requestAnimationFrame(tick);
    // If frames are throttled (background tab), finish anyway.
    const fallback = setTimeout(() => {
      cancelAnimationFrame(raf);
      setN(text.length);
      setDone(true);
    }, (text.length / cps) * 1000 + 1200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [inView, text, reduce, maxSeconds]);

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, n)}
        {!done && <span className="caret" />}
        <span className="opacity-0">{text.slice(n)}</span>
      </span>
    </p>
  );
}
