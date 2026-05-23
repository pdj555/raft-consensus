import { SectionHeader } from "@/components/SectionHeader";

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
    <section id="architecture" className="section-anchor section-pad border-t border-border bg-bg">
      <div className="section-shell">
        <SectionHeader
          label="Architecture"
          title="Modular by design"
          description="raft-core stays free of sockets and disk. Transport and storage plug in at the edges."
          aside={
            <a
              href="https://github.com/pdj555/raft-consensus/blob/main/docs/design.md"
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps btn-ghost shrink-0 px-4 py-2"
            >
              Design doc →
            </a>
          }
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <article
              key={mod.name}
              className="panel p-4 transition-colors duration-200 hover:border-border-bright"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-medium text-text">{mod.name}</h3>
                <span className="label-caps rounded-full border border-border px-2.5 py-0.5 text-[9px]">
                  {mod.tag}
                </span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-text-muted">{mod.description}</p>
              {mod.deps.length > 0 && (
                <p className="mt-4 text-[10px] text-text-faint">depends on {mod.deps.join(", ")}</p>
              )}
            </article>
          ))}
        </div>

        <div className="panel-inset mt-8 p-5 font-mono">
          <p className="label-caps mb-3">Quick start</p>
          <pre className="overflow-x-auto text-[11px] leading-[1.8] text-text-muted">
            <code>
              <span className="text-text-faint"># Clone and verify</span>
              {"\n"}
              <span className="text-text-faint">$</span> git clone https://github.com/pdj555/raft-consensus.git
              {"\n"}
              <span className="text-text-faint">$</span> cd raft-consensus && mvn clean verify
              {"\n\n"}
              <span className="text-text-faint"># Fast unit pass</span>
              {"\n"}
              <span className="text-text-faint">$</span> mvn test -DskipITs=true
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
