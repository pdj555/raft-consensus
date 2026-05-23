const modules = [
  {
    name: "raft-core",
    tag: "Algorithm",
    description: "Pure Raft — no I/O. Leader election, log replication, safety proofs.",
    deps: [],
  },
  {
    name: "raft-transport",
    tag: "Netty",
    description: "Length-prefixed binary frames over TCP. One boss, one worker group per node.",
    deps: ["raft-core"],
  },
  {
    name: "raft-storage",
    tag: "Persistence",
    description: "Memory-mapped 64MB log segments. CRC32-C checksums. Snapshot install RPC.",
    deps: ["raft-core"],
  },
  {
    name: "raft-cli",
    tag: "Tooling",
    description: "Admin commands and stress tools for cluster operations.",
    deps: ["raft-core"],
  },
  {
    name: "raft-integtest",
    tag: "Integration",
    description: "Wire-level monkey tests with TestContainers.",
    deps: ["raft-transport", "raft-storage"],
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="label-caps mb-2">Architecture</p>
            <h2
              className="text-3xl font-bold tracking-tight text-text sm:text-4xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Modular by design
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              raft-core stays free of sockets and disk. Transport and storage plug
              in at the edges. Virtual threads and Disruptor ring buffers on the hot path.
            </p>
          </div>
          <a
            href="https://github.com/pdj555/raft-consensus/blob/main/docs/design.md"
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps shrink-0 self-start rounded border border-border px-4 py-2 transition-colors hover:border-border-bright hover:text-text lg:self-auto"
          >
            Read design doc →
          </a>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <article
              key={mod.name}
              className="panel group relative overflow-hidden rounded p-5 transition-colors hover:border-border-bright"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-mono text-sm font-medium text-accent">
                  {mod.name}
                </h3>
                <span className="label-caps rounded border border-border px-2 py-0.5">
                  {mod.tag}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                {mod.description}
              </p>
              {mod.deps.length > 0 && (
                <p className="mt-4 text-[10px] text-text-muted/70">
                  → {mod.deps.join(", ")}
                </p>
              )}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                style={{ background: "rgba(184,255,60,0.08)" }}
              />
            </article>
          ))}
        </div>

        <div className="mt-12 panel rounded p-6">
          <p className="label-caps mb-4">Quick start</p>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-text-muted">
            <code>
              <span className="text-text-muted/50"># Clone and verify</span>
              {"\n"}
              <span className="text-accent">$</span> git clone
              https://github.com/pdj555/raft-consensus.git
              {"\n"}
              <span className="text-accent">$</span> cd raft-consensus
              {"\n"}
              <span className="text-accent">$</span> mvn clean verify
              {"\n\n"}
              <span className="text-text-muted/50"># Fast unit pass</span>
              {"\n"}
              <span className="text-accent">$</span> mvn test -DskipITs=true
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
