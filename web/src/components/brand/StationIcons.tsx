// Hand-drawn 20px stroke icons for the four stations of the loop.
type P = { className?: string; size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function VoteIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.5 16.5h13" />
      <rect x="4.5" y="9.5" width="3" height="5" rx="1" />
      <rect x="8.5" y="5.5" width="3" height="9" rx="1" />
      <rect x="12.5" y="3" width="3" height="11.5" rx="1" />
    </svg>
  );
}

export function EarnIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M10 3v8.5" />
      <path d="M6.5 8.5 10 12l3.5-3.5" />
      <path d="M3.5 12.5v1.5a2.5 2.5 0 0 0 2.5 2.5h8a2.5 2.5 0 0 0 2.5-2.5v-1.5" />
    </svg>
  );
}

export function BoostIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m5.5 10.5 4.5-4.5 4.5 4.5" />
      <path d="m5.5 15 4.5-4.5 4.5 4.5" />
      <path d="M10 2.5v1" />
    </svg>
  );
}

export function SaveIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4" width="14" height="12" rx="3" />
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 7.4V6.2M12.6 10h1.2M5.5 16.5v1M14.5 16.5v1" />
    </svg>
  );
}

export const STATION_ICONS = [VoteIcon, EarnIcon, BoostIcon, SaveIcon];
