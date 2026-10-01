import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useExperienceStore, type GenderFilter } from "../store/experience";

const MD_UP = "(min-width: 48rem)";

// fills are theme tokens (index.css); `dressedFor` completes the sentence
// "House companion, dressed for …"
const OUTFITS: Record<GenderFilter, { garment: string; accent: string; label: string; dressedFor: string }> = {
  all: { garment: "fill-figure-neutral", accent: "fill-accent-soft", label: "Both wardrobes", dressedFor: "both wardrobes" },
  men: { garment: "fill-accent", accent: "fill-accent-soft", label: "Menswear", dressedFor: "menswear" },
  women: { garment: "fill-blush", accent: "fill-canvas-b", label: "Womenswear", dressedFor: "womenswear" },
};

/**
 * A small figure that follows the shopper down the page and changes outfit
 * to match whichever wardrobe (men / women) is active. Lives bottom-right on
 * md+ only: on phones the fixed badge sat on top of the collection's prices
 * and product images. It is decorative and not interactive.
 */
export default function Companion() {
  const activeGender = useExperienceStore((s) => s.activeGender);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const outfit = OUTFITS[activeGender];
  // the badge is display:none below md, but Motion would still tick the
  // infinite float every frame — only run it where it's visible
  const [visible, setVisible] = useState(() => window.matchMedia(MD_UP).matches);
  useEffect(() => {
    const media = window.matchMedia(MD_UP);
    const onChange = (e: MediaQueryListEvent) => setVisible(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-8 right-8 z-[65] hidden flex-col items-end gap-2.5 md:flex">
      <m.div
        animate={reducedMotion || !visible ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          <m.div
            key={activeGender}
            role="img"
            aria-label={`House companion, dressed for ${outfit.dressedFor}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.9 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 22 }}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/50 bg-surface/50 shadow-float backdrop-blur-xl"
          >
            <svg viewBox="0 0 34 46" fill="none" aria-hidden="true" className="h-10 w-[30px]">
              <circle cx="17" cy="8" r="6.4" className="fill-figure-skin" />
              {/* garment body — this is the piece that swaps per wardrobe */}
              <path
                d="M8 20c0-3.6 4-6 9-6s9 2.4 9 6l1.6 18c.2 2-1.3 3.7-3.3 3.7H9.7c-2 0-3.5-1.7-3.3-3.7L8 20Z"
                className={outfit.garment}
              />
              {/* small per-wardrobe accessory so each outfit is a distinct
                  silhouette, not just a recolor of the same shape */}
              {activeGender === "men" && (
                <rect x="15.3" y="15" width="3.4" height="13" rx="1" className={outfit.accent} />
              )}
              {activeGender === "women" && (
                <path
                  d="M11.8 16.2c2.2 1.7 8.2 1.7 10.4 0l-1.1 3.6c-2.7 1.3-5.5 1.3-8.2 0Z"
                  className={outfit.accent}
                />
              )}
              <rect x="11" y="37" width="4.4" height="8.4" rx="1.6" className="fill-ink" />
              <rect x="18.6" y="37" width="4.4" height="8.4" rx="1.6" className="fill-ink" />
            </svg>
          </m.div>
        </AnimatePresence>
      </m.div>
      <span aria-hidden="true" className="rounded-full border border-white/50 bg-surface/50 px-3 py-1 font-sans text-label-xs font-medium uppercase text-ink-dim shadow-card backdrop-blur-xl">
        {outfit.label}
      </span>
    </div>
  );
}
