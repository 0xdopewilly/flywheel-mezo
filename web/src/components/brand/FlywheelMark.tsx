import { useId } from "react";

/**
 * The Flywheel mark: a track with four stations and a red-to-plum comet of energy.
 * `spinning` turns it into the app's loader (never a generic spinner).
 */
export function FlywheelMark({
  size = 28,
  spinning = false,
  className,
  title,
}: {
  size?: number;
  spinning?: boolean;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const r = 11.5;
  const c = 16;
  // comet: from the top, clockwise 150 degrees
  const a0 = -90;
  const a1 = 62;
  const p = (deg: number) =>
    [Math.round((c + r * Math.cos((deg * Math.PI) / 180)) * 100) / 100, Math.round((c + r * Math.sin((deg * Math.PI) / 180)) * 100) / 100] as const;
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`g${id}`} x1={x0} y1={y0} x2={x1} y2={y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D28D9" stopOpacity="0" />
          <stop offset="0.45" stopColor="#6D28D9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#B69CFF" />
        </linearGradient>
      </defs>
      <circle cx={c} cy={c} r={r} stroke="currentColor" strokeOpacity="0.14" strokeWidth="3.2" />
      <g className={spinning ? "fw-spin" : undefined}>
        <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} stroke={`url(#g${id})`} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx={x1} cy={y1} r="2.6" fill="#B69CFF" />
      </g>
      {[-90, 0, 90, 180].map((deg) => {
        const [x, y] = p(deg);
        return <circle key={deg} cx={x} cy={y} r="1.35" fill="currentColor" />;
      })}
    </svg>
  );
}

export function Loader({ label, size = 22, className = "" }: { label?: string; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-muted ${className}`} role="status" aria-live="polite">
      <FlywheelMark size={size} spinning className="text-ink" />
      {label ? <span className="text-[14px]">{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}
