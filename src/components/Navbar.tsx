import { lazy, Suspense, useState } from "react";
import { ShoppingBag, Menu } from "lucide-react";
import { scrollToSection } from "../lib/scroll";
import { useExperienceStore } from "../store/experience";
import { overlayLoaders } from "../lib/lazySections";
import Logo from "./Logo";

const MobileMenu = lazy(overlayLoaders.mobileMenu);

const LINKS = [
  { id: "collection", label: "Shop" },
  { id: "story", label: "House" },
  { id: "wardrobe", label: "Archive" },
  { id: "craft", label: "Craft" },
  { id: "lookbook", label: "Lookbook" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // the menu chunk is fetched on first open (or earlier, when the page idles)
  // and then stays mounted so its exit animation can run
  const [menuUsed, setMenuUsed] = useState(false);
  if (menuOpen && !menuUsed) setMenuUsed(true);
  const bagCount = useExperienceStore((s) => s.bagItems.reduce((n, i) => n + i.qty, 0));
  const setBagOpen = useExperienceStore((s) => s.setBagOpen);

  return (
    <>
      <header className="sticky top-0 z-50 mx-3 mt-3 flex items-center justify-between rounded-soft border border-white/40 bg-surface/45 max-md:bg-surface/90 px-6 py-4 shadow-card backdrop-blur-xl md:mx-6 md:mt-4 md:px-8">
        <button onClick={() => scrollToSection("top")} aria-label="Atelier — go to top">
          <Logo />
        </button>

        <nav className="hidden items-center gap-8 font-sans text-body-sm font-medium text-ink md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="group relative pb-1 transition-colors hover:text-accent-deep"
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
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent font-sans text-label-xs tracking-normal font-semibold text-surface">
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

      <Suspense fallback={null}>
        {menuUsed && <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />}
      </Suspense>
    </>
  );
}
