import Link from "next/link";
import { FlywheelMark } from "@/components/brand/FlywheelMark";

export function Footer() {
  return (
    <footer className="mt-24 md:mt-32">
      <div className="shell">
        <div className="flex flex-col gap-8 border-t border-line py-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <FlywheelMark size={26} className="mt-0.5 text-ink" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-[17px] font-bold uppercase tracking-[0.16em]">Flywheel</p>
              <p className="mt-1 max-w-[340px] text-[14px] leading-relaxed text-muted">
                A non-custodial autopilot for Mezo veBTC. Runs on Mezo testnet. Rewards are paid by Mezo, straight to you.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            <Link className="link-underline hover:text-ink" href="/app">
              Launch app
            </Link>
            <Link className="link-underline hover:text-ink" href="/guide">
              Start here
            </Link>
            <Link className="link-underline hover:text-ink" href="/deck">
              Deck
            </Link>
            <a className="link-underline hover:text-ink" href="https://github.com/0xdopewilly/flywheel-mezo" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link className="link-underline hover:text-ink" href="/how">
              How it works
            </Link>
            <a className="link-underline hover:text-ink" href="https://mezo.org" target="_blank" rel="noreferrer">
              mezo.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
