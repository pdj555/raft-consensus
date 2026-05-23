import { brand } from "@/lib/brand";

export function AuthorCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-muted ${className}`}>
      <a
        href={brand.links.portfolio}
        target="_blank"
        rel="noopener noreferrer"
        className="font-display font-medium tracking-[-0.02em] text-text transition-colors hover:text-accent"
      >
        {brand.person.name}
      </a>
      <span className="text-text-faint" aria-hidden="true">
        ·
      </span>
      <span className="label-caps text-text-faint">{brand.person.role}</span>
    </p>
  );
}
