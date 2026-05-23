"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { brand } from "@/lib/brand";

const links = [
  { href: "#cluster", label: "Cluster" },
  { href: "#architecture", label: "Architecture" },
  { href: "#protocol", label: "Protocol" },
  { href: brand.links.portfolio, label: "About", external: true },
  { href: brand.links.repo, label: "GitHub", external: true },
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
    const sections = links
      .filter((l) => !l.href.startsWith("http"))
      .map((l) => document.querySelector(l.href));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.2, 0.45] },
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background,border-color] duration-300 ${
        scrolled ? "border-b border-border bg-bg/92 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="section-shell flex h-12 items-center justify-between">
        <a href="#" className="group flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-[12px] font-semibold tracking-[-0.03em] text-text">
            Raft
          </span>
          <span className="label-caps hidden text-text-faint sm:inline">consensus</span>
        </a>

        <nav className="flex items-center">
          {links.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = !link.external && active === id;
            return (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`label-caps relative px-2.5 py-1.5 transition-colors sm:px-3 ${
                  isActive ? "text-text" : "text-text-muted hover:text-text"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-2.5 -bottom-[7px] h-px bg-accent/50 sm:inset-x-3" />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
