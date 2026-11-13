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
      <div className="rounded-[36px] bg-sky-soft px-6 py-12 sm:px-10 md:rounded-[44px] md:px-14 md:py-16">
        <Reveal className="max-w-[720px]">
          <h2 id="trust-title" className="display balance text-[clamp(36px,4.6vw,60px)]">
            Your keys. Your BTC. <span className="serif-accent">Its limits.</span>
          </h2>
          <p className="pretty mt-5 max-w-[540px] text-[17px] leading-[1.6] text-ink/70">
            The AI only ever moves value toward you, and only inside the limits you signed. Everything else is out of its reach.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2" gap={0.08}>
          {ITEMS.map((it) => (
            <StaggerItem key={it.t} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#171717" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {it.icon}
                </svg>
              </span>
              <div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em]">{it.t}</h3>
                <p className="pretty mt-1.5 text-[15px] leading-[1.55] text-ink/70">{it.d}</p>
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
          Let it <span className="serif-accent energy-text">spin.</span>
        </h2>
        <p className="pretty mt-5 max-w-[480px] text-[17px] leading-[1.6] text-ink/70">
          Connect a wallet with veBTC on Mezo testnet, set your limits, and the next epoch is handled. No wallet yet? The app shows the brain at work
          on a real veBTC.
        </p>
        <Link href="/app" className="btn btn-ink mt-9 h-[56px] px-7 text-[16px]">
          Open the app <Arrow />
        </Link>
      </Reveal>
    </section>
  );
}
