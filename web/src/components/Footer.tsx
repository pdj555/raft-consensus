export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="section-shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-[13px] font-semibold text-text">Raft Consensus</p>
          <p className="mt-1 text-[11px] text-text-faint">MIT · Java 21 · Modular distributed replication</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            ["GitHub", "https://github.com/pdj555/raft-consensus"],
            ["Design", "https://github.com/pdj555/raft-consensus/blob/main/docs/design.md"],
            ["Constitution", "https://github.com/pdj555/raft-consensus/blob/main/docs/constitution.md"],
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
    </footer>
  );
}
