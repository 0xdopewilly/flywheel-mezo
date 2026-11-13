import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Arrow } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Start here",
  description: "Flywheel for newcomers: what a veBTC is, the weekly loop, your first five minutes, every word explained, and what Flywheel can and can't do.",
};

const ve = (s: string) =>
  s.split("veBTC").flatMap((part, i, all) =>
    i < all.length - 1
      ? [
          part,
          <span key={i}>
            <span className="normal-case">ve</span>BTC
          </span>,
        ]
      : [part],
  );

const LOOP = [
  { t: "Thu 00:00", h: "Epoch opens", d: "A new week starts on Mezo Earn. Every veBTC can vote once in it." },
  { t: "Thu 01:00", h: "Voting opens", d: "Mezo opens the vote window an hour after the epoch starts." },
  { t: "Daily 20:00", h: "Keeper runs", d: "Harvests anything claimable and reinvests your budget. It casts the week’s single vote late (Tue or Wed evening), once incentives are known." },
  { t: "Wed 23:00", h: "Voting closes", d: "The window shuts an hour before the epoch ends." },
  { t: "Next Thu 00:00", h: "Rewards land", d: "This epoch’s incentives and fees become claimable, and the next run harvests them to your wallet." },
];

const FIRST = [
  { h: "Connect a wallet", d: "Any EVM wallet on Mezo testnet. Connecting only shares your address.", sign: "Nothing" },
  { h: "Get a test veBTC", d: "No veBTC? The app’s faucet locks a little test BTC into one, straight into your wallet, with gas and 15 MUSD.", sign: "Nothing" },
  { h: "Pick your limits", d: "Start from Safe, Balanced or Bold. The plan re-computes live as you change anything.", sign: "Nothing yet" },
  { h: "Arm the autopilot", d: "Approve the contract on your veBTC, save your limits onchain, and optionally allow a weekly MUSD budget.", sign: "Two or three small transactions" },
  { h: "Watch the first run", d: "Press “Run the brain now” or wait for the daily run. The plan and its reasoning appear in the onchain journal.", sign: "Nothing, the keeper pays gas" },
];

const WORDS = [
  { w: "veBTC", d: "BTC locked in Mezo Earn for a while, held as an NFT in your wallet. It carries voting power, and voting earns rewards." },
  { w: "Epoch", d: "One week on Mezo Earn, from Thursday 00:00 UTC. Each veBTC votes once per epoch." },
  { w: "Gauge (pool)", d: "Something you can vote for, like a trading pool or the MUSD Savings Vault. Each one pays rewards to the veBTC that voted for it." },
  { w: "Rewards per vote", d: "A gauge’s rewards divided by the votes already on it. A big pot with a big crowd can pay less per vote than a small, quiet one." },
  { w: "Incentives & fees", d: "What gauges pay voters: incentives posted by projects, plus trading fees. Claimable once the epoch ends." },
  { w: "Boost", d: "Extra voting power for your veBTC, up to 5×. It rises when veMEZO holders vote for your veBTC’s boost gauge. Flywheel can post incentives there to attract them; those incentives are paid to the voters, not back to you." },
  { w: "veMEZO", d: "Locked MEZO. Its holders choose which veBTC to boost, and they collect the incentives posted to attract them." },
  { w: "MUSD", d: "Mezo’s Bitcoin-backed dollar. It’s what Flywheel reinvests." },
  { w: "Savings Vault / sMUSD", d: "Mezo’s MUSD savings. Depositing gives you sMUSD, a receipt that grows in value. Flywheel sends it to your wallet." },
  { w: "Keeper", d: "The bot that runs the brain on schedule and sends the transactions. It can only do what the contract and your limits allow." },
  { w: "Limits (policy)", d: "Your rules, saved onchain: max share per pool, minimum pools, weekly MUSD budget, boost share, savings on or off." },
  { w: "Plan & journal", d: "Before every vote the brain writes a plan with its reasoning. It is published onchain with the vote, and the journal reads it back." },
];

const CAN = [
  { q: "Can it take my BTC or my veBTC?", a: "No. Your veBTC stays in your wallet. The contract can vote it and claim its rewards, which Mezo pays to you. It has no function to move, sell or unlock it." },
  { q: "Can it spend my MUSD?", a: "Only up to the weekly budget you set, and only two ways: into your own Savings Vault (the sMUSD comes back to you), or as incentives on your own boost gauge, which pay the veMEZO holders who boost you. No allowance, no reinvesting." },
  { q: "What does it cost?", a: "Voting and harvesting are free. Flywheel keeps 5% of the MUSD it reinvests, which pays for the keeper. The contract caps the fee at 10%." },
  { q: "How do I stop it?", a: "Press “Exit autopilot” in the app. For good measure, also revoke the NFT approval in your wallet. Votes already cast this epoch stay until it ends." },
  { q: "Is this real money?", a: "Not here. Flywheel runs on Mezo testnet, where tokens have no value, so you can try everything safely." },
];

const WHY = [
  { q: "Why didn’t it vote?", a: "A veBTC votes once per epoch, so if it already voted this week the next vote is Thursday. Also: voting is closed Wed 23:00 to Thu 01:00 UTC, and an expired lock has no voting power." },
  { q: "Why is there nothing to claim?", a: "Rewards for this week’s vote arrive when the epoch ends (Thursday 00:00 UTC). The keeper harvests them on its next run." },
  { q: "Why didn’t it reinvest?", a: "It needs MUSD in your wallet, an MUSD allowance (step 3 of arming), and room left in this week’s budget. The autopilot panel shows how many weeks of allowance remain." },
  { q: "My boost didn’t go up.", a: "Flywheel posts incentives to your boost gauge. The boost only rises when veMEZO holders vote for it. When nobody is bidding, Flywheel offers half of what the boost is worth to you." },
  { q: "My wallet says wrong network or no gas.", a: "Switch to Mezo testnet (the app offers a one-click switch). The test veBTC comes with gas, or get test BTC at faucet.test.mezo.org." },
];

export default function GuidePage() {
  return (
    <>
      <Nav />
      <main className="shell pb-10 pt-8 md:pt-14">
        <Reveal>
          <p className="eyebrow">Start here</p>
          <h1 className="display mt-3 text-[clamp(44px,7vw,92px)]">
            Flywheel in <span className="energy-text">60 seconds.</span>
          </h1>
          <p className="pretty mt-5 max-w-[680px] text-[17px] leading-[1.65] text-ink/80">
            {ve("You lock BTC on Mezo and get a veBTC. Every week it can vote, and voting earns rewards. Flywheel does that weekly work for you: it votes where your veBTC earns most, collects the rewards, and puts your MUSD back to work, only inside rules you sign. Here is everything you need to know first.")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/app" className="btn btn-ink">
              Try it now <Arrow />
            </Link>
            <a href="#words" className="btn btn-ghost">
              Words you’ll see
            </a>
          </div>
        </Reveal>

        {/* weekly loop */}
        <section className="mt-16 md:mt-24" aria-labelledby="loop-title">
          <p className="eyebrow">01 · The weekly loop (UTC)</p>
          <h2 id="loop-title" className="display mt-2 text-[clamp(30px,4vw,48px)]">
            One week, <span className="energy-text">on repeat</span>
          </h2>
          <div className="hud glass mt-6 p-5 sm:p-8">
            <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
              <span className="absolute left-[7px] top-2 hidden h-px w-[calc(100%-14px)] bg-[repeating-linear-gradient(90deg,#b69cff_0_6px,transparent_6px_10px)] opacity-50 md:block" aria-hidden />
              {LOOP.map((x, i) => (
                <li key={x.h} className="relative pl-6 md:pl-0 md:pt-7">
                  <span className={`absolute left-0 top-1 h-[15px] w-[15px] rotate-45 border md:top-[1px] ${i === 2 ? "border-gold bg-gold/30" : "border-violet-hi bg-paper"}`} aria-hidden />
                  <p className="hud-num text-[13px] tracking-[0.12em] text-gold">{x.t}</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-[19px] font-bold uppercase tracking-[0.05em]">{x.h}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{x.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* first five minutes */}
        <section className="mt-16 md:mt-24" aria-labelledby="first-title">
          <p className="eyebrow">02 · Your first five minutes</p>
          <h2 id="first-title" className="display mt-2 text-[clamp(30px,4vw,48px)]">
            From zero to <span className="energy-text">autopilot</span>
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {FIRST.map((x, i) => (
              <li key={x.h} className="hud flex flex-col p-5">
                <p className="hud-num text-[12px] tracking-[0.22em] text-gold">Step 0{i + 1}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-[19px] font-bold uppercase leading-tight tracking-[0.04em]">{ve(x.h)}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{ve(x.d)}</p>
                <p className="mt-auto pt-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-violet-hi">You sign: {x.sign}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* glossary */}
        <section id="words" className="mt-16 scroll-mt-24 md:mt-24" aria-labelledby="words-title">
          <p className="eyebrow">03 · Words you’ll see</p>
          <h2 id="words-title" className="display mt-2 text-[clamp(30px,4vw,48px)]">
            The <span className="energy-text">glossary</span>
          </h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORDS.map((x) => (
              <div key={x.w} className="hud p-5">
                <dt className="font-[family-name:var(--font-display)] text-[20px] font-bold uppercase tracking-[0.05em] text-ink">{ve(x.w)}</dt>
                <dd className="mt-1.5 text-[14px] leading-relaxed text-muted">{ve(x.d)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* safety + troubleshooting */}
        <section className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-2" aria-label="Questions">
          <div>
            <p className="eyebrow">04 · Can Flywheel…?</p>
            <h2 className="display mt-2 text-[clamp(28px,3.4vw,42px)]">
              What it <span className="energy-text">can’t</span> do
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              {CAN.map((x) => (
                <details key={x.q} className="hud group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-[family-name:var(--font-display)] text-[17px] font-bold uppercase tracking-[0.04em]">
                    {ve(x.q)}
                    <span className="hud-num text-gold transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">{ve(x.a)}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">05 · Why didn’t it…?</p>
            <h2 className="display mt-2 text-[clamp(28px,3.4vw,42px)]">
              <span className="energy-text">Troubleshooting</span>
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              {WHY.map((x) => (
                <details key={x.q} className="hud group p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-[family-name:var(--font-display)] text-[17px] font-bold uppercase tracking-[0.04em]">
                    {ve(x.q)}
                    <span className="hud-num text-gold transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">{ve(x.a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <Reveal className="hud hud-lg glass mt-16 flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center md:mt-24 md:p-10">
          <div>
            <p className="eyebrow">Ready?</p>
            <p className="display mt-2 text-[clamp(26px,3.4vw,40px)]">Try it with a free test veBTC</p>
            <p className="mt-2 max-w-[520px] text-[14.5px] text-muted">Connect any wallet on Mezo testnet. The mission panel walks you through every step.</p>
          </div>
          <Link href="/app" className="btn btn-ink h-[54px] px-8">
            Launch app <Arrow />
          </Link>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
