"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * A number that counts up the first time it enters view, then glides between later values.
 * Writes straight to the DOM node, so it never re-renders React per frame.
 */
export function CountUp({
  value,
  format,
  duration = 1.4,
  className,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const shown = useRef<number | null>(null);
  const fmt = useRef(format);
  fmt.current = format;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!inView) {
      node.textContent = fmt.current(0);
      return;
    }
    if (reduce || !Number.isFinite(value)) {
      node.textContent = fmt.current(value);
      shown.current = value;
      return;
    }
    const from = shown.current ?? 0;
    const controls = animate(from, value, {
      duration: shown.current === null ? duration : 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = fmt.current(v);
      },
      onComplete: () => {
        node.textContent = fmt.current(value);
      },
    });
    shown.current = value;
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={`tnum ${className ?? ""}`} aria-label={format(value)}>
      {format(value)}
    </span>
  );
}
