import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="section-shell relative pt-28 pb-14">
        <div className="animate-fade-up max-w-2xl">
          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-live">
              <span className="h-1 w-1 rounded-full bg-live animate-pulse-live" />
              Live sim
            </span>
            <span className="text-text-faint" aria-hidden="true">
              ·
            </span>
            <span className="label-caps text-text-faint">Java 21</span>
            <span className="text-text-faint" aria-hidden="true">
              ·
            </span>
            <a
              href={brand.links.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps text-text-faint transition-colors hover:text-text-muted"
            >
              {brand.person.name}
            </a>
          </div>

          <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-text">
            Distributed
            <br />
            <span className="text-accent-muted">consensus</span>
          </h1>

          <p className="mt-5 max-w-md text-[12px] leading-[1.75] text-text-muted">
            Pure Raft. Algorithm isolated from I/O. Netty transport, memory-mapped
            segments, sub-150ms commit targets.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <a href="#cluster" className="label-caps btn-primary rounded px-4 py-2">
              View cluster
            </a>
            <a
              href={brand.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps btn-ghost rounded px-4 py-2"
            >
              Repository
            </a>
          </div>
        </div>

        <dl className="animate-fade-up stagger-2 mt-12 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          {[
            ["Modules", "5"],
            ["Safety", "§5.4"],
            ["Target p99", "<150ms"],
            ["Nodes", "5"],
          ].map(([label, value]) => (
            <div key={label} className="bg-bg px-4 py-3.5">
              <dt className="label-caps">{label}</dt>
              <dd className="font-display metric-value mt-1.5 text-lg font-semibold text-text">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
