export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-bg-elevated ${className}`}
      aria-hidden="true"
    >
      <span className="h-1 w-1 rounded-full bg-accent/80" />
    </span>
  );
}
