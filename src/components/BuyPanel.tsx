import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { useExperienceStore } from "../store/experience";
import { unsplash, type CollectionPiece } from "../data/collection";
import { useFocusTrap } from "../hooks/useFocusTrap";
import ShimmerImage from "./ShimmerImage";
import { formatPrice } from "../lib/format";

export default function BuyPanel() {
  const piece = useExperienceStore((s) => s.selectedPiece);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const close = () => setSelectedPiece(null);
  const containerRef = useFocusTrap(Boolean(piece), close);

  return (
    <AnimatePresence>
      {piece && (
        <m.div
          className="fixed inset-0 z-[80] flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${piece.name} — purchase`}
        >
          <m.button
            aria-label="Close"
            className="absolute inset-0 bg-ink/30 max-md:bg-ink/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.3 }}
            onClick={close}
          />
          <m.div
            ref={containerRef}
            data-lenis-prevent
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto rounded-l-shell border-l border-white/40 bg-surface/70 max-md:bg-surface/95 backdrop-blur-2xl"
            initial={{ x: reducedMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reducedMotion ? 0 : "100%" }}
            transition={{ duration: reducedMotion ? 0.05 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={close}
              aria-label="Close panel"
              className="absolute right-5 top-5 z-10 rounded-full border border-white/50 bg-surface/60 p-2 text-ink-dim shadow-md backdrop-blur-md transition-colors hover:text-accent-deep"
            >
              <X size={18} strokeWidth={1.6} />
            </button>
            <Details piece={piece} onDone={close} />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

const ADULT_SIZE_GUIDE: [string, string, string][] = [
  ["XS", "32-34\"", "26-28\""],
  ["S", "35-37\"", "29-31\""],
  ["M", "38-40\"", "32-34\""],
  ["L", "41-43\"", "35-37\""],
  ["XL", "44-46\"", "38-40\""],
];

function Details({ piece, onDone }: { piece: CollectionPiece; onDone: () => void }) {
  const addToBag = useExperienceStore((s) => s.addToBag);
  const setBagOpen = useExperienceStore((s) => s.setBagOpen);
  const bagItems = useExperienceStore((s) => s.bagItems);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [needsSize, setNeedsSize] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL"];
  // included in the announcement so adding the same size again still changes
  // the live region's text (an unchanged string isn't re-announced)
  const inBag = bagItems.find((i) => i.piece.id === piece.id && i.size === size)?.qty ?? 0;

  const requireSize = () => {
    if (!size) {
      setNeedsSize(true);
      return false;
    }
    return true;
  };

  return (
    <>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-b-card bg-surface-soft">
        <ShimmerImage
          src={unsplash(piece.image, 700)}
          alt={piece.name}
          style={{ objectPosition: piece.objectPosition }}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-7 py-8">
        <div>
          <p className="font-sans text-label-xs uppercase text-ink-dim">
            {piece.index} — {piece.category} · {piece.gender}
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-ink">{piece.name}</h3>
          <p className="mt-1 font-sans text-base font-medium text-accent-deep">
            {formatPrice(piece.price)}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-y border-ink/10 py-4 font-sans text-body-sm text-ink-dim">
          <p>
            <span className="text-ink">Fabric — </span>
            {piece.fabric}
          </p>
          <p>
            <span className="text-ink">Fit — </span>
            {piece.fit}
          </p>
          <p>
            <span className="text-ink">Care — </span>
            {piece.care}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-sans text-label-xs uppercase text-ink-dim">Size</p>
            <button
              onClick={() => setShowGuide((v) => !v)}
              aria-expanded={showGuide}
              aria-controls="size-guide-table"
              className="font-sans text-label-xs uppercase text-accent-deep underline-offset-2 hover:underline"
            >
              {showGuide ? "Hide size guide" : "Size guide"}
            </button>
          </div>

          {showGuide && (
            <div
              id="size-guide-table"
              className="mb-3 overflow-hidden rounded-xl border border-white/50 bg-surface/40 backdrop-blur-md"
            >
              <table className="w-full font-sans text-body-sm text-ink-dim">
                <thead>
                  <tr className="border-b border-ink/10 text-ink">
                    <th className="px-3 py-2 text-left font-medium">Size</th>
                    <th className="px-3 py-2 text-left font-medium">Chest</th>
                    <th className="px-3 py-2 text-left font-medium">Waist</th>
                  </tr>
                </thead>
                <tbody>
                  {ADULT_SIZE_GUIDE.map(([s, chest, waist]) => (
                    <tr key={s} className="border-b border-ink/5 last:border-0">
                      <td className="px-3 py-2">{s}</td>
                      <td className="px-3 py-2">{chest}</td>
                      <td className="px-3 py-2">{waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* h-11/min-w-11: 44px touch targets (the chips were ~32px tall) */}
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                aria-pressed={s === size}
                onClick={() => {
                  setSize(s);
                  setNeedsSize(false);
                  // "Added to Bag" described the previous size, not this one
                  setAdded(false);
                }}
                className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 font-sans text-label-sm tracking-normal transition-colors ${
                  s === size
                    ? "border-accent bg-accent text-surface"
                    : "border-ink/15 text-ink-dim hover:border-accent/50 hover:text-accent-deep"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {needsSize && (
            <p role="alert" className="mt-2 font-sans text-body-sm text-accent-deep">
              Please select a size first.
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button
            onClick={() => {
              if (!requireSize() || !size) return;
              addToBag(piece, size);
              setAdded(true);
            }}
            className="w-full rounded-full bg-accent py-4 font-sans text-label-sm font-semibold uppercase text-surface transition-colors hover:bg-accent-deep"
          >
            {added ? "Added to Bag" : "Add to Bag"}
          </button>
          {/* announces the add for screen readers — the button's own label
              change isn't reliably read out while it keeps focus */}
          <p role="status" className="sr-only">
            {added && size ? `Added ${piece.name}, size ${size}. ${inBag} in your bag.` : ""}
          </p>
          {added && (
            <button
              onClick={() => {
                onDone();
                setBagOpen(true);
              }}
              className="w-full rounded-full border border-accent/40 py-4 font-sans text-label-sm font-semibold uppercase text-accent-deep transition-colors hover:border-accent hover:bg-accent/10"
            >
              View bag
            </button>
          )}
          <button
            onClick={() => {
              if (!requireSize() || !size) return;
              addToBag(piece, size);
              onDone();
              setBagOpen(true);
            }}
            className="w-full rounded-full border border-ink/15 py-4 font-sans text-label-sm font-semibold uppercase text-ink transition-colors hover:border-accent hover:text-accent-deep"
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}
