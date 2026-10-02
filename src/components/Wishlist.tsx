import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { useExperienceStore } from "../store/experience";
import { COLLECTION, unsplash } from "../data/collection";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { scrollToSection } from "../lib/scroll";
import ShimmerImage from "./ShimmerImage";
import { formatPrice } from "../lib/format";

/** Saved pieces: the same drawer pattern as the Bag (focus trap, scroll lock, lenis-prevent). */
export default function Wishlist() {
  const open = useExperienceStore((s) => s.wishlistOpen);
  const setOpen = useExperienceStore((s) => s.setWishlistOpen);
  const wishlist = useExperienceStore((s) => s.wishlist);
  const removeFromWishlist = useExperienceStore((s) => s.removeFromWishlist);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const close = () => setOpen(false);
  const containerRef = useFocusTrap(open, close);
  const pieces = wishlist
    .map((id) => COLLECTION.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[85] flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Saved pieces"
        >
          <m.button
            aria-label="Close saved pieces"
            className="absolute inset-0 bg-ink/30 max-md:bg-ink/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.3 }}
            onClick={close}
          />
          <m.div
            ref={containerRef}
            className="relative flex h-full w-full max-w-md flex-col rounded-l-shell border-l border-white/40 bg-surface/70 max-md:bg-surface/95 backdrop-blur-2xl"
            initial={{ x: reducedMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reducedMotion ? 0 : "100%" }}
            transition={{ duration: reducedMotion ? 0.05 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-7 py-6">
              <h2 className="font-display text-xl font-bold text-ink">
                Saved {pieces.length > 0 && `(${pieces.length})`}
              </h2>
              <button
                onClick={close}
                aria-label="Close saved pieces"
                className="rounded-full border border-white/50 bg-surface/60 p-2 text-ink-dim backdrop-blur-md transition-colors hover:text-accent-deep"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>

            {pieces.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-7 text-center">
                <p className="font-display text-lg font-semibold text-ink">Nothing saved yet.</p>
                <p className="font-sans text-body-sm text-ink-dim">
                  Tap the heart on any piece to keep it here.
                </p>
                <button
                  onClick={() => {
                    close();
                    scrollToSection("collection");
                  }}
                  className="mt-4 rounded-full bg-accent px-6 py-3 font-sans text-label-sm font-semibold uppercase text-surface transition-colors hover:bg-accent-deep"
                >
                  Browse the collection
                </button>
              </div>
            ) : (
              <div data-lenis-prevent className="flex-1 overflow-y-auto px-7 py-6">
                <ul className="flex flex-col gap-6">
                  {pieces.map((piece) => (
                    <li key={piece.id} className="flex gap-4">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                        <ShimmerImage
                          src={unsplash(piece.image, 200)}
                          alt=""
                          style={{ objectPosition: piece.objectPosition }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="font-display text-base font-semibold text-ink">{piece.name}</p>
                          <p className="mt-1 font-sans text-label-xs uppercase text-ink-dim">
                            {piece.category}
                          </p>
                        </div>
                        <p className="font-sans text-body-sm font-medium text-accent-deep">
                          {formatPrice(piece.price)}
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              close();
                              setSelectedPiece(piece);
                            }}
                            aria-label={`View ${piece.name}`}
                            className="font-sans text-label-xs font-semibold uppercase text-accent-deep underline-offset-2 hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => removeFromWishlist(piece.id)}
                            aria-label={`Remove ${piece.name} from saved`}
                            className="font-sans text-label-xs uppercase text-ink-dim underline-offset-2 transition-colors hover:text-accent-deep hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
