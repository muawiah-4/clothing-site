import { ArrowUpRight } from "lucide-react";
import { scrollToSection } from "../lib/scroll";
import Logo from "./Logo";

const SITEMAP = [
  { id: "collection", label: "Shop" },
  { id: "story", label: "House" },
  { id: "wardrobe", label: "Archive" },
  { id: "craft", label: "Craft" },
  { id: "lookbook", label: "Lookbook" },
  { id: "contact", label: "Contact" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export default function Footer() {
  return (
    <footer className="mt-16 px-6 py-14 md:px-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <button onClick={() => scrollToSection("top")} aria-label="Atelier — go to top">
            <Logo />
          </button>
          <p className="mt-4 font-sans text-body-sm leading-relaxed text-ink-dim">
            A small studio. A dozen pieces a season. Considered pieces, made to outlast trend.
          </p>
        </div>

        <div className="flex flex-wrap gap-16 sm:gap-24">
          <div>
            <p className="font-sans text-label-xs font-semibold uppercase text-accent-deep">
              Sitemap
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SITEMAP.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="font-sans text-body-sm text-ink-dim transition-colors hover:text-accent-deep"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sans text-label-xs font-semibold uppercase text-accent-deep">
              Follow
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 font-sans text-body-sm text-ink-dim transition-colors hover:text-accent-deep"
                  >
                    {s.label}
                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.6}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-ink/10 pt-6 font-sans text-label-xs uppercase text-ink-dim sm:flex-row sm:items-center sm:justify-between">
        <span>Atelier © 2026 — All rights reserved</span>
        {/* no privacy or terms pages exist yet, so these stay plain text
            rather than links to nowhere. One run of normal-case text (instead
            of two spaced-out uppercase items) keeps them from reading as a
            pair of links */}
        <span className="normal-case tracking-normal">Privacy · Terms</span>
      </div>
    </footer>
  );
}
