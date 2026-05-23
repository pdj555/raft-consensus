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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-border bg-bg/90 backdrop-blur-md"
          : "border-transparent bg-bg/70 backdrop-blur-sm"
      }`}
    >
      <div className="section-shell flex h-14 items-center justify-between gap-4">
        <a href="#main" className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-text">
          <BrandMark />
          Raft
        </a>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <nav
            aria-label="Sections"
            className="flex min-w-0 items-center overflow-x-auto scrollbar-hide"
          >
            {primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-active={active === link.href.slice(1) ? "true" : "false"}
                className="nav-link px-3 py-2 text-[14px] text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <span className="divider-v mx-1 hidden h-4 shrink-0 sm:block" aria-hidden="true" />

          <nav aria-label="External links" className="hidden shrink-0 items-center sm:flex">
            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link px-3 py-2 text-[14px] text-text-faint transition-colors hover:text-text-muted"
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
