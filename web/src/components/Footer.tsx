import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="section-shell flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-text">
            {brand.person.name}
          </p>
          <p className="mt-2 text-[14px] text-text-muted">
            {brand.person.role} ·{" "}
            <a href={brand.links.email} className="transition-colors hover:text-text">
              {brand.person.email}
            </a>
          </p>
          <p className="mt-4 text-[13px] text-text-faint">
            {brand.project.name} · MIT · Java 21
          </p>
        </div>

        <nav
          aria-label="Footer links"
          className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end"
        >
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
              className="text-[14px] text-text-muted transition-colors hover:text-text"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
