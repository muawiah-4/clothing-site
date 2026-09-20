import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useExperienceStore, type GenderFilter } from "../store/experience";

const OUTFITS: Record<GenderFilter, { garment: string; skin: string; label: string; accent: string }> = {
  all: { garment: "#3a332a", skin: "#c9a978", label: "Browsing", accent: "#b6905a" },
  // was #20201d — nearly identical to the puck's own background, so the
  // Men outfit swap read as an empty torso. Walnut-soft ties it back to the
  // wardrobe prop the whole palette is drawn from, and actually shows up.
  men: { garment: "#4a3420", skin: "#c9a978", label: "Dressed for Men", accent: "#8a6b41" },
  women: { garment: "#c9b79a", skin: "#c9a978", label: "Dressed for Women", accent: "#8a6b41" },
  kids: { garment: "#e0a13a", skin: "#c9a978", label: "Dressed for Kids", accent: "#c98a2e" },
};

/**
 * A small companion that follows the shopper down the page and changes
 * outfit to match whichever wardrobe (men / women / kids) is active. Lives
 * bottom-right (not bottom-left) so it never sits on top of the Hero's
 * closing pull-quote, and is visible on mobile too, not just desktop — a
 * character that vanishes on the device most fashion traffic actually uses
 * isn't much of a companion. Tapping it is a small, tasteful easter egg.
 */
export default function Companion() {
  const activeGender = useExperienceStore((s) => s.activeGender);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const outfit = OUTFITS[activeGender];
  const [greetCount, setGreetCount] = useState(0);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[65] flex flex-col items-end gap-2 md:bottom-8 md:right-8 md:gap-2.5">
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.button
            key={activeGender}
            type="button"
            onClick={() => setGreetCount((g) => g + 1)}
            aria-label={`House companion — ${outfit.label.toLowerCase()}. Tap to say hello.`}
            initial={{ opacity: 0, y: 14, scale: 0.8, rotate: -6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: !reducedMotion && greetCount % 2 === 1 ? [0, -12, 9, -5, 0] : 0,
            }}
            exit={{ opacity: 0, y: -10, scale: 0.85, rotate: 6 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-paper/20 bg-ink-soft/90 backdrop-blur-md md:h-[72px] md:w-[72px]"
            style={{ boxShadow: "0 18px 32px -8px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03)" }}
          >
            <svg viewBox="0 0 34 46" fill="none" aria-hidden="true" className="h-7 w-5 md:h-10 md:w-[30px]">
              {/* kids' hood sits behind the head */}
              {activeGender === "kids" && (
                <path
                  d="M17 3.6c4 0 6.2 3 5.7 7.4-1.8-1.1-3.6-1.8-5.7-1.8s-3.9.7-5.7 1.8C10.8 6.6 13 3.6 17 3.6Z"
                  fill={outfit.accent}
                  opacity="0.85"
                />
              )}
              <circle cx="17" cy="8" r="6.4" fill={outfit.skin} />
              {/* garment body — this is the piece that swaps per wardrobe */}
              <motion.path
                key={outfit.garment}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                d="M8 20c0-3.6 4-6 9-6s9 2.4 9 6l1.6 18c.2 2-1.3 3.7-3.3 3.7H9.7c-2 0-3.5-1.7-3.3-3.7L8 20Z"
                fill={outfit.garment}
              />
              {/* small per-wardrobe accessory so each outfit is a distinct
                  silhouette, not just a recolor of the same shape */}
              {activeGender === "men" && (
                <rect x="15.3" y="15" width="3.4" height="13" rx="1" fill={outfit.accent} />
              )}
              {activeGender === "women" && (
                <path
                  d="M11.8 16.2c2.2 1.7 8.2 1.7 10.4 0l-1.1 3.6c-2.7 1.3-5.5 1.3-8.2 0Z"
                  fill={outfit.accent}
                />
              )}
              <rect x="11" y="37" width="4.4" height="8.4" rx="1.6" fill="#161310" />
              <rect x="18.6" y="37" width="4.4" height="8.4" rx="1.6" fill="#161310" />
            </svg>
          </motion.button>
        </AnimatePresence>
      </motion.div>
      <span className="rounded-full border border-paper/10 bg-ink-soft/80 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.1em] text-paper-dim backdrop-blur-md">
        {outfit.label}
      </span>
    </div>
  );
}
