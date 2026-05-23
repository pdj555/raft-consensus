import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="section-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-[13px] font-semibold tracking-[-0.02em] text-text">
            {brand.person.name}
          </p>
          <p className="mt-1.5 text-[11px] text-text-muted">
            {brand.person.role} ·{" "}
            <a href={brand.links.email} className="transition-colors hover:text-text">
              {brand.person.email}
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex flex-wrap gap-x-4 gap-y-2 lg:justify-end">
            {[
              ["Portfolio", brand.links.portfolio],
              ["GitHub", brand.links.github],
              ["LinkedIn", brand.links.linkedin],
              ["Design", `${brand.links.repo}/blob/main/docs/design.md`],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps text-text-muted transition-colors hover:text-text"
              >
                {label}
              </a>
            ))}
          </div>
          <p className="text-[10px] text-text-faint">
            {brand.project.name} · MIT · Java 21
          </p>
        </div>
      </div>
    </footer>
  );
}
