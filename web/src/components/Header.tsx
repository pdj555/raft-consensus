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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
      className={`fixed inset-x-0 top-0 z-40 transition-[background,border-color] duration-500 ${
        scrolled ? "border-b border-border bg-bg/90 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="section-shell flex h-[3.25rem] items-center justify-between">
        <a href="#" className="group flex items-center gap-3">
          <BrandMark />
          <span className="flex flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-live" />
              <span className="font-display text-[13px] font-semibold tracking-[-0.02em] text-text">
                Raft
              </span>
              <span className="label-caps hidden text-text-faint sm:inline">consensus</span>
            </span>
            <span className="label-caps hidden text-[9px] text-text-faint transition-colors group-hover:text-text-muted lg:inline">
              {brand.person.name}
            </span>
          </span>
        </a>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = !link.external && active === id;
            return (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`label-caps relative rounded-md px-3 py-1.5 transition-colors ${
                  isActive ? "text-text" : "text-text-muted hover:text-text"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[9px] h-px bg-accent/70" />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
