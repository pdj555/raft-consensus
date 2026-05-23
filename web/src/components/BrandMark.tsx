export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-md bg-accent/[0.06]" />
      <span className="font-display text-[10px] font-semibold tracking-[-0.04em] text-accent">
        PJ
      </span>
    </span>
  );
}
