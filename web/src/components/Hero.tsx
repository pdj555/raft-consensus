import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden="true" />

      <div className="section-shell relative pt-28 pb-12">
        <div className="animate-fade-up max-w-xl">
          <p className="label-caps mb-4 text-text-faint">Distributed replication · Java 21</p>

          <h1 className="font-display text-[clamp(2.1rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-text">
            Consensus at
            <br />
            <span className="text-accent-muted">wire speed</span>
          </h1>

          <p className="mt-4 max-w-md text-[12px] leading-[1.75] text-text-muted">
            Pure Raft with algorithm isolated from I/O. Netty transport, memory-mapped
            segments, sub-150ms commit targets.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
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

        <dl className="animate-fade-up stagger-2 mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          {[
            ["Modules", "5"],
            ["Safety", "§5.4"],
            ["Target p99", "<150ms"],
            ["Nodes", "5"],
          ].map(([label, value]) => (
            <div key={label} className="bg-bg px-4 py-3">
              <dt className="label-caps">{label}</dt>
              <dd className="font-display metric-value mt-1 text-base font-semibold text-text">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-[10px] text-text-faint">
          By{" "}
          <a
            href={brand.links.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted transition-colors hover:text-text"
          >
            {brand.person.name}
          </a>
        </p>
      </div>
    </section>
  );
}
