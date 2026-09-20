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
  const pieces = COLLECTION.filter((p) => activeGender === "all" || p.gender === activeGender);

  return (
    <section id="collection" className="scroll-mt-24 bg-ink px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <motion.div {...fade(reducedMotion, { y: 16, duration: 0.7 })}>
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-brass">
              The Archive, Opened
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-paper sm:text-5xl">
              Shop the Wardrobe.
            </h2>
          </motion.div>
          <p className="max-w-sm font-sans text-[13px] leading-relaxed text-paper-dim">
            Three wardrobes, one philosophy — tailoring, outerwear, and eveningwear cut for men,
            women, and the smallest members of the house.
          </p>
        </div>

        {/* wardrobe tabs — also drives the companion's outfit down in the corner */}
        <div
          role="tablist"
          aria-label="Filter by wardrobe"
          className="mb-12 flex flex-wrap gap-2 border-b border-paper/10 pb-6 md:mb-16"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeGender === tab.id}
              onClick={() => setActiveGender(tab.id)}
              className={`border px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.15em] transition-colors ${
                activeGender === tab.id
                  ? "border-paper bg-paper text-ink"
                  : "border-paper/20 text-paper-dim hover:border-paper/50 hover:text-paper"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 gap-x-4 gap-y-14 sm:grid-cols-3 md:gap-x-6 md:gap-y-20"
        >
          {pieces.map((piece, i) => (
            <CollectionCard key={piece.id} piece={piece} index={i} reducedMotion={reducedMotion} />
          ))}
        </motion.div>

        {pieces.length === 0 && (
          <p className="py-16 text-center font-sans text-[13px] text-paper-dim">
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
        <div className="aspect-[3/4] overflow-hidden bg-ink-soft">
          <img
            src={unsplash(piece.image, 700)}
            alt={piece.name}
            loading="lazy"
            className="h-full w-full object-cover grayscale-[45%] brightness-[1.06] contrast-[1.03] transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100"
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-paper/10 pt-3">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-paper-dim">
              {piece.index} — {piece.category}
            </p>
            <p className="mt-1 font-display text-lg italic text-paper">{piece.name}</p>
          </div>
          <p className="font-sans text-[13px] text-paper-dim">${piece.price.toLocaleString()}</p>
        </div>
      </button>
    </motion.div>
  );
}
