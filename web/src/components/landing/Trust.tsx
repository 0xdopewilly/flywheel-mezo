import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Arrow } from "@/components/site/Nav";
import { FlywheelMark } from "@/components/brand/FlywheelMark";

const ITEMS = [
  {
    t: "Non-custodial",
    d: "You approve the contract to vote. Your veBTC stays in your wallet the whole time, and you can see it there.",
    icon: (
      <path d="M12 3.5 5 6.5v5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9v-5l-7-3Z M9 12l2.2 2.2L15.5 10" />
    ),
  },
  {
    t: "Rewards paid to you by Mezo",
    d: "When the brain harvests, Mezo sends fees and incentives straight to the owner of the veBTC. They never pass through Flywheel.",
    icon: <path d="M12 4v10m0 0-4-4m4 4 4-4M5 15.5V17a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 17v-1.5" />,
  },
  {
    t: "Limits the contract enforces",
    d: "Per-pool cap, minimum spread, boost share and weekly MUSD budget live on-chain. A plan that breaks one reverts.",
    icon: <path d="M4 7h10m4 0h2M4 17h2m4 0h10M14 4.5v5M6 14.5v5" />,
  },
  {
    t: "Exit any time",
    d: "One transaction stops the autopilot. Revoke the approval as well and Flywheel can no longer touch the veBTC at all.",
    icon: <path d="M14 4.5h3.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H14M10 8l-4 4 4 4M6 12h9" />,
  },
];

export function Trust() {
  return (
    <section className="shell mt-28 md:mt-40" aria-labelledby="trust-title">
      <div className="hud hud-lg glass px-6 py-12 sm:px-10 md:px-14 md:py-16">
        <div className="dots pointer-events-none absolute right-8 top-8 hidden h-[70px] w-[120px] opacity-40 md:block" aria-hidden />
        <Reveal className="max-w-[720px]">
          <p className="eyebrow">Guardrails</p>
          <h2 id="trust-title" className="display balance mt-2 text-[clamp(34px,4.4vw,58px)]">
            Your keys. Your BTC. <span className="energy-text">Its limits.</span>
          </h2>
          <p className="pretty mt-5 max-w-[540px] text-[16px] leading-[1.65] text-muted">
            The AI only ever moves value toward you, and only inside the limits you signed. Everything else is out of its reach.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2" gap={0.08}>
          {ITEMS.map((it) => (
            <StaggerItem key={it.t} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center border border-violet-hi/40 bg-violet/10 [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B69CFF" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
                  {it.icon}
                </svg>
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-[19px] font-bold uppercase tracking-[0.05em]">{it.t}</h3>
                <p className="pretty mt-1.5 text-[14.5px] leading-[1.6] text-muted">{it.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="shell mt-28 md:mt-40">
      <Reveal className="flex flex-col items-center text-center">
        <FlywheelMark size={56} spinning className="text-ink [&_.fw-spin]:[animation-duration:3.2s]" />
        <h2 className="display balance mt-8 text-[clamp(44px,7vw,104px)]">
          Let it <span className="energy-text">spin.</span>
        </h2>
        <p className="pretty mt-5 max-w-[500px] text-[16px] leading-[1.65] text-muted">
          Connect a wallet on Mezo testnet, set your limits, and the next epoch is handled. No veBTC yet? The app hands you a test one, gas included.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/app" className="btn btn-ink h-[56px] px-8 text-[16px]">
            Launch app <Arrow />
          </Link>
          <Link href="/deck" className="btn btn-ghost h-[56px] px-8 text-[16px]">
            Read the deck
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
