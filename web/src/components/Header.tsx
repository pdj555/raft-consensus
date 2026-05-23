"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#cluster", label: "Cluster" },
  { href: "#architecture", label: "Architecture" },
  { href: "#protocol", label: "Protocol" },
  { href: "https://github.com/pdj555/raft-consensus", label: "GitHub", external: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("cluster");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .filter((l) => !l.external)
      .map((l) => document.querySelector(l.href));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-bg/85 backdrop-blur-xl" : "bg-bg/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
          </span>
          <span
            className="text-sm font-semibold tracking-tight text-text"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            RAFT
          </span>
          <span className="label-caps hidden sm:inline">consensus</span>
        </a>

        <nav className="flex items-center gap-0.5">
          {links.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = !link.external && active === id;
            return (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`label-caps rounded px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:bg-white/5 hover:text-text"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
