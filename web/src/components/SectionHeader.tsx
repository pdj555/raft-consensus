import type { ReactNode } from "react";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function SectionHeader({ label, title, description, aside }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-xl">
        <p className="label-caps mb-2.5">{label}</p>
        <h2 className="font-display text-[1.65rem] font-semibold tracking-[-0.035em] text-text sm:text-[1.85rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[12px] leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {aside}
    </div>
  );
}
