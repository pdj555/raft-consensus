export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 bg-text ${className}`}
      aria-hidden="true"
    />
  );
}
