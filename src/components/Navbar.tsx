import { useState } from "react";
import { ShoppingBag, Menu } from "lucide-react";
import { scrollToSection } from "../lib/scroll";
import { useExperienceStore } from "../store/experience";
import MobileMenu from "./MobileMenu";

const LINKS = [
  { id: "story", label: "House" },
  { id: "wardrobe", label: "Archive" },
  { id: "craft", label: "Craft" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const bagCount = useExperienceStore((s) => s.bagItems.reduce((n, i) => n + i.qty, 0));
  const setBagOpen = useExperienceStore((s) => s.setBagOpen);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 mix-blend-exclusion md:px-10 md:py-8">
        <button
          onClick={() => scrollToSection("top")}
          className="font-display text-xl italic tracking-wide text-paper"
        >
          Atelier
        </button>

        <nav className="hidden items-center gap-8 font-sans text-[11px] uppercase tracking-[0.18em] text-paper md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setBagOpen(true)}
            aria-label={`Open bag${bagCount > 0 ? `, ${bagCount} item${bagCount === 1 ? "" : "s"}` : ""}`}
            className="relative text-paper opacity-70 transition-opacity hover:opacity-100"
          >
            <ShoppingBag size={18} strokeWidth={1.4} />
            {bagCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brass font-sans text-[9px] text-ink">
                {bagCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="text-paper opacity-70 transition-opacity hover:opacity-100 md:hidden"
          >
            <Menu size={20} strokeWidth={1.4} />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
