export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border pt-28 pb-10">
      <div className="grid-bg absolute inset-0 opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(184,255,60,0.2) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl animate-fade-up">
            <p className="label-caps mb-4">Distributed systems research</p>
            <h1
              className="text-4xl font-bold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Raft
              <span className="text-accent"> Consensus</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-text-muted">
              Modular Java 21 implementation. Pure algorithm core, Netty transport,
              memory-mapped storage — engineered for wire-level clarity.
            </p>
          </div>

          <div className="animate-fade-up stagger-2 grid grid-cols-2 gap-px overflow-hidden rounded border border-border sm:grid-cols-4 lg:max-w-xl">
            {[
              { label: "Modules", value: "5" },
              { label: "Safety", value: "§5.4" },
              { label: "p99 target", value: "<150ms" },
              { label: "Nodes", value: "5" },
            ].map((stat) => (
              <div key={stat.label} className="panel px-4 py-3">
                <p className="label-caps">{stat.label}</p>
                <p
                  className="metric-value mt-1 text-xl font-semibold text-text"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
