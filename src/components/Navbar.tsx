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
      <header className="sticky top-0 z-50 mx-3 mt-3 flex items-center justify-between rounded-2xl bg-surface/90 px-6 py-4 shadow-[0_10px_30px_-16px_rgba(78,66,110,0.35)] backdrop-blur-md md:mx-6 md:mt-4 md:px-8">
        <button
          onClick={() => scrollToSection("top")}
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          Atelier
        </button>

        <nav className="hidden items-center gap-8 font-sans text-[13px] font-medium text-ink md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="group relative pb-1 transition-colors hover:text-accent"
            >
              {link.label}
              <span className="absolute -bottom-[1px] left-0 h-[2px] w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setBagOpen(true)}
            aria-label={`Open bag${bagCount > 0 ? `, ${bagCount} item${bagCount === 1 ? "" : "s"}` : ""}`}
            className="relative text-ink transition-colors hover:text-accent"
          >
            <ShoppingBag size={19} strokeWidth={1.6} />
            {bagCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent font-sans text-[9px] font-semibold text-surface">
                {bagCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="text-ink transition-colors hover:text-accent md:hidden"
          >
            <Menu size={20} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
