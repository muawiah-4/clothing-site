import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useExperienceStore } from "../store/experience";
import { unsplash, type CollectionPiece } from "../data/collection";
import { useFocusTrap } from "../hooks/useFocusTrap";

export default function BuyPanel() {
  const piece = useExperienceStore((s) => s.selectedPiece);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const close = () => setSelectedPiece(null);
  const containerRef = useFocusTrap(Boolean(piece), close);

  return (
    <AnimatePresence>
      {piece && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${piece.name} — purchase`}
        >
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          />
          <motion.div
            ref={containerRef}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-paper/10 bg-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={close}
              aria-label="Close panel"
              className="absolute right-5 top-5 z-10 rounded-full bg-ink/70 p-2 text-paper-dim backdrop-blur-sm transition-colors hover:text-paper"
            >
              <X size={18} strokeWidth={1.4} />
            </button>
            <Details piece={piece} onDone={close} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Details({ piece, onDone }: { piece: CollectionPiece; onDone: () => void }) {
  const addToBag = useExperienceStore((s) => s.addToBag);
  const setBagOpen = useExperienceStore((s) => s.setBagOpen);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [needsSize, setNeedsSize] = useState(false);
  const sizes = piece.gender === "kids" ? ["2-3Y", "4-5Y", "6-7Y", "8-9Y"] : ["XS", "S", "M", "L", "XL"];

  const requireSize = () => {
    if (!size) {
      setNeedsSize(true);
      return false;
    }
    return true;
  };

  return (
    <>
      <div className="aspect-[3/4] w-full overflow-hidden border-b border-paper/10">
        <img src={unsplash(piece.image, 700)} alt={piece.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-7 py-8">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-paper-dim">
            {piece.index} — {piece.category} · {piece.gender}
          </p>
          <h3 className="mt-2 font-display text-2xl italic text-paper">{piece.name}</h3>
          <p className="mt-1 font-sans text-[15px] text-paper-dim">${piece.price.toLocaleString()}</p>
        </div>

        <div>
          <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.15em] text-paper-dim">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                aria-pressed={s === size}
                onClick={() => {
                  setSize(s);
                  setNeedsSize(false);
                }}
                className={`min-w-[2.6rem] border px-3 py-2 font-sans text-[12px] transition-colors ${
                  s === size
                    ? "border-paper bg-paper text-ink"
                    : "border-paper/20 text-paper-dim hover:border-paper/50 hover:text-paper"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {needsSize && (
            <p className="mt-2 font-sans text-[12px] text-brass">Please select a size first.</p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button
            onClick={() => {
              if (!requireSize() || !size) return;
              addToBag(piece, size);
              setAdded(true);
            }}
            className="w-full bg-paper py-4 font-sans text-[12px] uppercase tracking-[0.15em] text-ink transition-colors hover:bg-brass"
          >
            {added ? "Added to Bag" : "Add to Bag"}
          </button>
          <button
            onClick={() => {
              if (!requireSize() || !size) return;
              addToBag(piece, size);
              onDone();
              setBagOpen(true);
            }}
            className="w-full border border-paper/25 py-4 font-sans text-[12px] uppercase tracking-[0.15em] text-paper transition-colors hover:border-paper"
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}
