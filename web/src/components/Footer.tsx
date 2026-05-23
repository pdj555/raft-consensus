export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 sm:flex-row sm:items-center">
        <div>
          <p
            className="text-sm font-semibold text-text"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Raft Consensus
          </p>
          <p className="mt-1 text-xs text-text-muted">
            MIT License · Java 21 · Modular distributed replication
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-[11px]">
          <a
            href="https://github.com/pdj555/raft-consensus"
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps transition-colors hover:text-text"
          >
            GitHub
          </a>
          <a
            href="https://github.com/pdj555/raft-consensus/blob/main/docs/design.md"
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps transition-colors hover:text-text"
          >
            Design
          </a>
          <a
            href="https://github.com/pdj555/raft-consensus/blob/main/docs/constitution.md"
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps transition-colors hover:text-text"
          >
            Constitution
          </a>
        </div>
      </div>
    </footer>
  );
}
