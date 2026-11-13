import Link from "next/link";
import { FlywheelMark } from "./FlywheelMark";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="focus-ring group inline-flex items-center gap-2.5 rounded-full" aria-label="Flywheel home">
      <FlywheelMark size={30} className="text-ink transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-90" />
      <span className="font-[family-name:var(--font-display)] text-[21px] font-bold uppercase tracking-[0.16em] text-ink">Flywheel</span>
    </Link>
  );
}
