import type { ReactNode } from "react";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function SectionHeader({ label, title, description, aside }: SectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="label-caps mb-3">{label}</p>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-text sm:text-[2rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-[13px] leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {aside}
    </div>
  );
}
