"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

const KEY = "fw:theme";

export function readTheme(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Follows the html[data-theme] attribute, so any component can react to the toggle. */
export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>("dark");
  useEffect(() => {
    setMode(readTheme());
    const mo = new MutationObserver(() => setMode(readTheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return mode;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const mode = useThemeMode();
  const next: ThemeMode = mode === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        if (next === "light") document.documentElement.dataset.theme = "light";
        else delete document.documentElement.dataset.theme;
        try {
          localStorage.setItem(KEY, next);
        } catch {
          /* private mode */
        }
      }}
      className={`focus-ring grid h-9 w-9 place-items-center border border-line-strong text-muted transition-colors hover:border-violet-hi hover:text-ink [clip-path:polygon(7px_0,100%_0,100%_calc(100%-7px),calc(100%-7px)_100%,0_100%,0_7px)] ${className}`}
    >
      {mode === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7 13 13M3 13l1.3-1.3M11.7 4.3 13 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/** Runs before paint (inlined in <head>) so the page never flashes the wrong theme. */
export const THEME_BOOT = `try{if(localStorage.getItem("${KEY}")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;
