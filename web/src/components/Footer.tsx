import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
            {brand.person.name}
          </p>
          <p className="mt-2 text-[12px] text-text-muted">
            {brand.person.role} ·{" "}
            <a href={brand.links.email} className="transition-colors hover:text-text">
              {brand.person.email}
            </a>
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {[
              ["Portfolio", brand.links.portfolio],
              ["GitHub", brand.links.github],
              ["LinkedIn", brand.links.linkedin],
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
        </div>

        <div className="flex flex-col justify-between gap-6 lg:items-end lg:text-right">
          <div>
            <p className="font-display text-[13px] font-semibold text-text">{brand.project.name}</p>
            <p className="mt-1 text-[11px] text-text-faint">{brand.project.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
            {[
              ["Repository", brand.links.repo],
              ["Design", `${brand.links.repo}/blob/main/docs/design.md`],
              ["Constitution", `${brand.links.repo}/blob/main/docs/constitution.md`],
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
          <p className="text-[10px] text-text-faint">MIT · Java 21</p>
        </div>
      </div>
    </footer>
  );
}
