import type { ReactNode } from "react";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function SectionHeader({ label, title, description, aside }: SectionHeaderProps) {
  return (
    <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <p className="label-caps mb-3">{label}</p>
        <h2 className="text-[1.75rem] font-semibold tracking-[-0.04em] text-text sm:text-[2rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {aside}
    </header>
  );
}
