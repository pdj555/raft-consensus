export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border pt-32 pb-16">
      <div className="grid-bg absolute inset-0 opacity-[0.35]" aria-hidden="true" />

      <div className="section-shell relative">
        <div className="animate-fade-up max-w-3xl">
          <p className="label-caps mb-5">Distributed replication</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-text">
            Consensus,
            <br />
            <span className="text-accent">precisely engineered</span>
          </h1>
          <p className="mt-6 max-w-lg text-[13px] leading-[1.7] text-text-muted">
            Pure Raft in Java 21. Algorithm isolated from I/O. Netty transport,
            memory-mapped segments, sub-150ms commit targets.
          </p>
        </div>

        <dl className="animate-fade-up stagger-2 mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-8">
          {[
            ["Modules", "5"],
            ["Safety", "§5.4"],
            ["Target p99", "<150ms"],
            ["Cluster size", "5 nodes"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="label-caps">{label}</dt>
              <dd className="font-display metric-value mt-1.5 text-xl font-semibold text-text">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
