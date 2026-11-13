"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

const LINKS = [
  { href: "/how", label: "How it works" },
  { href: "/app", label: "App" },
];

export function Nav({ right }: { right?: ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));
  const path = usePathname();

  return (
    <header className="sticky top-0 z-40">
      <motion.div
        className="absolute inset-0 border-b bg-paper/80 backdrop-blur-xl"
        initial={false}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ borderColor: "rgba(23,23,23,0.06)" }}
      />
      <nav className="shell relative flex h-[68px] items-center justify-between gap-3 md:h-[76px]">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.filter((l) => l.href !== "/app" || !right).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`focus-ring hidden rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors sm:inline-block ${
                path === l.href ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/how" className={`focus-ring rounded-full px-2.5 py-2 text-[14px] font-medium sm:hidden ${path === "/how" ? "text-ink" : "text-muted"}`}>
            How
          </Link>
          {right ?? (
            <Link href="/app" className="btn btn-ink btn-sm ml-1">
              Open the app
              <Arrow />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M2 7h9.5M7.5 3 11.5 7l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExternalArrow({ className = "" }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
