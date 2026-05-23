export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-text ${className}`}
      aria-hidden="true"
    />
  );
}
