import { useState } from "react";
import { motion } from "motion/react";
import { COLLECTION, unsplash, type CollectionPiece } from "../data/collection";
import { useExperienceStore, type GenderFilter } from "../store/experience";
import { fade } from "../lib/motion";

const TABS: { id: GenderFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
];

export default function Collection() {
  const activeGender = useExperienceStore((s) => s.activeGender);
  const setActiveGender = useExperienceStore((s) => s.setActiveGender);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [activeCategory, setActiveCategory] = useState("all");

  const genderPieces = COLLECTION.filter((p) => activeGender === "all" || p.gender === activeGender);
  const categories = Array.from(new Set(genderPieces.map((p) => p.category)));
  const pieces = genderPieces.filter(
    (p) => activeCategory === "all" || p.category === activeCategory,
  );

  return (
    <section
      id="collection"
      className="scroll-mt-24 mx-3 mt-3 rounded-[2rem] border border-white/40 bg-surface/55 px-6 py-20 shadow-[0_24px_60px_-30px_rgba(46,42,82,0.35)] backdrop-blur-2xl md:mx-6 md:mt-4 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <motion.div {...fade(reducedMotion, { y: 16, duration: 0.7 })}>
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep">
              The Archive, Opened
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
              Shop the Wardrobe.
            </h2>
          </motion.div>
          <p className="max-w-sm font-sans text-[13px] leading-relaxed text-ink-dim">
            Three wardrobes, one philosophy — tailoring, outerwear, and eveningwear cut for men,
            women, and the smallest members of the house.
          </p>
        </div>

        {/* wardrobe tabs — also drives the companion's outfit down in the corner */}
        <div
          role="tablist"
          aria-label="Filter by wardrobe"
          className="mb-12 flex flex-wrap gap-2 border-b border-ink/10 pb-6 md:mb-16"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeGender === tab.id}
              onClick={() => {
                setActiveGender(tab.id);
                setActiveCategory("all");
              }}
              className={`rounded-full border px-5 py-2.5 font-sans text-[12px] font-medium uppercase tracking-[0.1em] backdrop-blur-md transition-colors ${
                activeGender === tab.id
                  ? "border-accent bg-accent text-surface"
                  : "border-white/50 bg-surface/30 text-ink-dim hover:border-accent/50 hover:text-accent-deep"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {categories.length > 1 && (
          <div
            role="tablist"
            aria-label="Filter by category"
            className="mb-10 flex flex-wrap gap-2 md:mb-12"
          >
            <button
              onClick={() => setActiveCategory("all")}
              aria-selected={activeCategory === "all"}
              className={`rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.08em] transition-colors ${
                activeCategory === "all" ? "text-accent-deep underline" : "text-ink-dim hover:text-accent-deep"
              }`}
            >
              All categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-selected={activeCategory === cat}
                className={`rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.08em] transition-colors ${
                  activeCategory === cat ? "text-accent-deep underline" : "text-ink-dim hover:text-accent-deep"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <motion.div
          layout
          className="grid grid-cols-2 gap-x-4 gap-y-14 sm:grid-cols-3 md:gap-x-6 md:gap-y-20"
        >
          {pieces.map((piece, i) => (
            <CollectionCard key={piece.id} piece={piece} index={i} reducedMotion={reducedMotion} />
          ))}
        </motion.div>

        {pieces.length === 0 && (
          <p className="py-16 text-center font-sans text-[13px] text-ink-dim">
            Nothing in this wardrobe yet — check back for the next drop.
          </p>
        )}
      </div>
    </section>
  );
}

function CollectionCard({
  piece,
  index,
  reducedMotion,
}: {
  piece: CollectionPiece;
  index: number;
  reducedMotion: boolean;
}) {
  const setCursorVariant = useExperienceStore((s) => s.setCursorVariant);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const offset = index % 3 === 1 ? "sm:mt-14" : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={offset}
    >
      <button
        className="group block w-full text-left"
        onMouseEnter={() => setCursorVariant("view")}
        onMouseLeave={() => setCursorVariant("default")}
        onClick={() => setSelectedPiece(piece)}
      >
        <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-surface-soft shadow-[0_16px_34px_-20px_rgba(46,42,82,0.35)]">
          <img
            src={unsplash(piece.image, 700)}
            alt={piece.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-3">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-ink-dim">
              {piece.index} — {piece.category}
            </p>
            <p className="mt-1 font-display text-base font-semibold text-ink">{piece.name}</p>
          </div>
          <p className="font-sans text-[13px] font-medium text-accent-deep">
            ${piece.price.toLocaleString()}
          </p>
        </div>
      </button>
    </motion.div>
  );
}
