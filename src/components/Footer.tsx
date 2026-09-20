import { ArrowUpRight } from "lucide-react";
import { scrollToSection } from "../lib/scroll";

const SITEMAP = [
  { id: "story", label: "House" },
  { id: "wardrobe", label: "Archive" },
  { id: "craft", label: "Craft" },
  { id: "contact", label: "Contact" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

/**
 * The site previously ended after Contact with two lines of copyright text
 * and nothing else — no sitemap, no social, no legal line. This is the
 * closing moment a visitor sees right after deciding whether to trust the
 * house enough to inquire, so it earns real weight of its own.
 */
export default function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink-soft px-6 py-16 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <button
            onClick={() => scrollToSection("top")}
            className="font-display text-2xl italic text-paper"
          >
            Atelier
          </button>
          <p className="mt-4 font-sans text-[13px] leading-relaxed text-paper-dim">
            A small studio. A dozen pieces a season. Form in material.
          </p>
        </div>

        <div className="flex flex-wrap gap-16 sm:gap-24">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brass">
              Sitemap
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SITEMAP.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="font-sans text-[13px] text-paper-dim transition-colors hover:text-paper"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brass">Follow</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-1 font-sans text-[13px] text-paper-dim transition-colors hover:text-paper"
                  >
                    {s.label}
                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.4}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-paper/10 pt-6 font-sans text-[11px] uppercase tracking-[0.1em] text-paper-dim sm:flex-row sm:items-center sm:justify-between">
        <span>Atelier © 2026 — All rights reserved</span>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-paper">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-paper">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
