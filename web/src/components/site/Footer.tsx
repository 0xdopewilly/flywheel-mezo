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
              <p className="text-[15px] font-semibold tracking-[-0.01em]">Flywheel</p>
              <p className="mt-1 max-w-[340px] text-[14px] leading-relaxed text-muted">
                A non-custodial autopilot for Mezo veBTC. Runs on Mezo testnet. Rewards are paid by Mezo, straight to you.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
            <Link className="link-underline hover:text-ink" href="/app">
              Open the app
            </Link>
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
