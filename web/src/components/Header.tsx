"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { brand } from "@/lib/brand";

const primaryLinks = [
  { href: "#cluster", label: "Cluster" },
  { href: "#architecture", label: "Architecture" },
  { href: "#protocol", label: "Protocol" },
];

const externalLinks = [
  { href: brand.links.portfolio, label: "About" },
  { href: brand.links.repo, label: "GitHub" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("cluster");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = primaryLinks.map((l) => document.querySelector(l.href));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.15, 0.35] },
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "border-border bg-bg" : "border-transparent bg-bg/80"
      }`}
    >
      <div className="section-shell flex h-12 items-center justify-between gap-3">
        <a href="#main" className="flex shrink-0 items-center gap-2.5">
          <BrandMark />
          <span className="label-caps text-text">Raft</span>
        </a>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <nav
            aria-label="Sections"
            className="flex min-w-0 items-center overflow-x-auto scrollbar-hide"
          >
            {primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-active={active === link.href.slice(1) ? "true" : "false"}
                className="nav-link label-caps px-2 py-1.5 text-text-muted transition-colors hover:text-text sm:px-3"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <span className="divider-v hidden h-3 shrink-0 sm:block" aria-hidden="true" />

          <nav aria-label="External links" className="hidden shrink-0 items-center sm:flex">
            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link label-caps px-2 py-1.5 text-text-faint transition-colors hover:text-text-muted sm:px-3"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
