import type { ReactNode } from "react";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function SectionHeader({ label, title, description, aside }: SectionHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-lg">
        <p className="label-caps mb-2">{label}</p>
        <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.035em] text-text sm:text-[1.75rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-2.5 max-w-md text-[12px] leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {aside}
    </header>
  );
}
