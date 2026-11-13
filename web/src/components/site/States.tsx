import type { ReactNode } from "react";

/** A calm, branded error: what happened in plain words, and one thing to do about it. */
export function ErrorState({
  title,
  detail,
  onRetry,
  className = "",
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-start gap-4 sm:flex-row sm:items-center ${className}`} role="alert">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden className="shrink-0">
        <circle cx="22" cy="22" r="16" stroke="#F1ECFF" strokeOpacity="0.14" strokeWidth="4" />
        <path d="M22 6a16 16 0 0 1 13.86 8" stroke="#B69CFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M22 15.5v8" stroke="#F1ECFF" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="22" cy="28.5" r="1.4" fill="#F1ECFF" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
        {detail && <p className="mt-0.5 text-[14px] leading-relaxed text-muted">{detail}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-ghost btn-sm">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-[17px] font-semibold tracking-[-0.015em]">{title}</p>
      {children && <div className="max-w-[46ch] text-[15px] leading-relaxed text-muted">{children}</div>}
      {action}
    </div>
  );
}
