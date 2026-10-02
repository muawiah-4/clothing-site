import { useId, useState, type Ref } from "react";
import { AnimatePresence, LazyMotion, domMax, m } from "motion/react";
import { Search } from "lucide-react";
import { COLLECTION, SIZES, unsplash, unsplashSrcSet, type CollectionPiece } from "../data/collection";
import { useExperienceStore, type GenderFilter } from "../store/experience";
import { fade } from "../lib/motion";
import ShimmerImage from "../components/ShimmerImage";
import SplitReveal from "../components/SplitReveal";
import FilterPills from "../components/FilterPills";
import WishlistButton from "../components/WishlistButton";
import { formatPrice } from "../lib/format";
import { queryCollection, SORT_OPTIONS, type SortKey } from "../lib/collection-query";
import { pieceStockStatus, useStock } from "../hooks/useStock";

// 2 columns below sm, 3 from sm up, inside a max-w-7xl container
const CARD_WIDTHS = [300, 400, 600, 800];
const CARD_SIZES = "(min-width: 1440px) 400px, (min-width: 640px) 30vw, 46vw";

const TABS: { id: GenderFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
];

export default function Collection() {
  const activeGender = useExperienceStore((s) => s.activeGender);
  const setActiveGender = useExperienceStore((s) => s.setActiveGender);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const searchId = useId();
  const sortId = useId();

  const genderPieces = COLLECTION.filter((p) => activeGender === "all" || p.gender === activeGender);
  const categories = Array.from(new Set(genderPieces.map((p) => p.category)));
  const pieces = queryCollection(COLLECTION, {
    gender: activeGender,
    category: activeCategory,
    search,
    sort,
  });
  const filtered = search.trim() !== "" || activeCategory !== "all" || activeGender !== "all";
  const clearFilters = () => {
    setSearch("");
    setActiveCategory("all");
    setActiveGender("all");
  };

  // `layout` + popLayout need Motion's projection engine (domMax). Loading it
  // here keeps it in this lazy chunk instead of the entry bundle, where the
  // app-wide LazyMotion only carries domAnimation.
  return (
    <LazyMotion features={domMax}>
      <section
        id="collection"
        className="scroll-mt-24 px-6 py-16 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <m.div {...fade(reducedMotion, { y: 16, duration: 0.7 })}>
              <p className="font-sans text-label-xs font-semibold uppercase text-accent-deep">
                The Collection, Opened
              </p>
              <SplitReveal
                as="h2"
                text="Twelve pieces, this season."
                className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl"
              />
            </m.div>
            <p className="max-w-sm font-sans text-body-sm leading-relaxed text-ink-dim">
              Tailoring, outerwear and eveningwear for men and women, cut and finished in the Paris
              atelier in small numbers.
            </p>
          </div>

          {/* wardrobe filter — also drives the companion's outfit down in the corner */}
          <FilterPills
            label="Filter by wardrobe"
            options={TABS}
            value={activeGender}
            onChange={(id) => {
              setActiveGender(id);
              setActiveCategory("all");
            }}
            className="mb-8 border-b border-ink/10 pb-6 md:mb-10"
          />

          <div className="mb-10 flex flex-col gap-4 md:mb-12 lg:flex-row lg:items-center lg:justify-between">
            {categories.length > 1 ? (
              <FilterPills
                label="Filter by category"
                size="sm"
                options={[
                  { id: "all", label: "All categories" },
                  ...categories.map((cat) => ({ id: cat, label: cat })),
                ]}
                value={activeCategory}
                onChange={setActiveCategory}
              />
            ) : (
              <span />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={searchId} className="sr-only">
                Search the collection
              </label>
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <Search
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-dim"
                />
                <input
                  id={searchId}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, fabric…"
                  autoComplete="off"
                  className="h-10 w-full rounded-full border border-white/50 bg-surface/30 pl-9 pr-4 font-sans text-body-sm text-ink backdrop-blur-md placeholder:text-ink-dim focus:border-accent/60 sm:w-56"
                />
              </div>
              <label htmlFor={sortId} className="sr-only">
                Sort by
              </label>
              <select
                id={sortId}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 cursor-pointer rounded-full border border-white/50 bg-surface/30 px-4 font-sans text-label-xs font-medium uppercase text-ink-dim backdrop-blur-md hover:border-accent/50 hover:text-accent-deep"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* announces how many pieces the filters left, without moving focus */}
          <p role="status" className="sr-only">
            {filtered ? `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"} shown` : ""}
          </p>

          {/* md:pb-40 keeps the last row's prices clear of the fixed Companion
              badge (72px button + label, 32px from the viewport bottom) when
              the grid is scrolled to its end on desktop */}
          <m.div
            layout
            className="grid grid-cols-2 gap-x-4 gap-y-14 sm:grid-cols-3 md:gap-x-6 md:gap-y-20 md:pb-40"
          >
            {/* without AnimatePresence the cards' exit animation never ran —
                filtered-out cards just vanished. popLayout pairs with `layout`
                so the remaining cards reflow while the leaving ones fade. */}
            <AnimatePresence mode="popLayout">
              {pieces.map((piece, i) => (
                <CollectionCard key={piece.id} piece={piece} index={i} reducedMotion={reducedMotion} />
              ))}
            </AnimatePresence>
          </m.div>

          {pieces.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-display text-lg font-semibold text-ink">No pieces match.</p>
              <p className="max-w-sm font-sans text-body-sm text-ink-dim">
                {search.trim()
                  ? `Nothing this season matches “${search.trim()}”. Try a fabric, like wool or silk.`
                  : "Nothing here this season. The next collection is still on the cutting table."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full bg-accent px-6 py-3 font-sans text-label-sm font-semibold uppercase text-surface transition-colors hover:bg-accent-deep"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </LazyMotion>
  );
}

function CollectionCard({
  piece,
  index,
  reducedMotion,
  ref,
}: {
  piece: CollectionPiece;
  index: number;
  reducedMotion: boolean;
  // popLayout measures each exiting child through its ref (React 19: ref is a plain prop)
  ref?: Ref<HTMLDivElement>;
}) {
  const setCursorLabel = useExperienceStore((s) => s.setCursorLabel);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const { left } = useStock();
  const stock = pieceStockStatus(SIZES.map((size) => left(piece.id, size)));
  const offset = index % 3 === 1 ? "sm:mt-14" : "";

  return (
    <m.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={offset}
    >
      {/* The heading can't live inside the button: <button> only allows
          phrasing content, and its children are presentational to assistive
          tech, so an h3 in there never reaches the heading outline. Instead
          the h3 holds the button, and the button's ::after is stretched over
          the whole card so the image and price stay clickable. The focus
          ring is drawn around the card rather than just the name (the
          button's own ring needs `!` to beat the unlayered global
          :focus-visible rule in index.css). */}
      <div className="group relative rounded-card outline-offset-4 has-[h3_button:focus-visible]:outline-2 has-[h3_button:focus-visible]:outline-ink has-[h3_button:focus-visible]:outline-solid">
        <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-surface-dim shadow-card">
          <ShimmerImage
            src={unsplash(piece.image, 600)}
            srcSet={unsplashSrcSet(piece.image, CARD_WIDTHS)}
            sizes={CARD_SIZES}
            width={600}
            height={800}
            alt=""
            loading="lazy"
            style={{ objectPosition: piece.objectPosition }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {stock && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/50 bg-surface/75 px-3 py-1 font-sans text-label-xs font-semibold uppercase text-accent-deep backdrop-blur-md">
              {stock === "sold-out" ? "Sold out" : "Low stock"}
            </span>
          )}
          {/* above the name button's stretched ::after, so it gets its own clicks */}
          <WishlistButton piece={piece} className="absolute right-3 top-3 z-10" />
        </div>
        {/* stacked below sm: at 2 columns (~150px cards on a 390px phone) the
            meta line and price didn't fit side by side and the meta wrapped
            under the price */}
        <div className="mt-4 flex flex-col gap-1 border-t border-ink/10 pt-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="font-sans text-label-xs uppercase text-ink-dim">
              {piece.index} — {piece.category}
            </p>
            <h3 className="mt-1 font-display text-base font-semibold text-ink">
              <button
                type="button"
                className="text-left after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none!"
                onMouseEnter={() => setCursorLabel("View")}
                onMouseLeave={() => setCursorLabel(null)}
                onClick={() => setSelectedPiece(piece)}
              >
                {piece.name}
              </button>
            </h3>
          </div>
          <p className="shrink-0 font-sans text-body-sm font-medium text-accent-deep">
            {formatPrice(piece.price)}
          </p>
        </div>
      </div>
    </m.div>
  );
}
