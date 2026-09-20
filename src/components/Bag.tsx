import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useExperienceStore } from "../store/experience";
import { unsplash } from "../data/collection";
import { useFocusTrap } from "../hooks/useFocusTrap";

/**
 * The "Add to Bag" payoff — previously the bag count lived only in the
 * store and was never rendered anywhere, so adding an item had no visible,
 * lasting consequence. This gives it a real destination.
 */
export default function Bag() {
  const open = useExperienceStore((s) => s.bagOpen);
  const setOpen = useExperienceStore((s) => s.setBagOpen);
  const items = useExperienceStore((s) => s.bagItems);
  const close = () => setOpen(false);
  const containerRef = useFocusTrap(open, close);

  const total = items.reduce((sum, i) => sum + i.piece.price * i.qty, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Your bag"
        >
          <motion.button
            aria-label="Close bag"
            className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          />
          <motion.div
            ref={containerRef}
            className="relative flex h-full w-full max-w-md flex-col border-l border-paper/10 bg-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-paper/10 px-7 py-6">
              <h2 className="font-display text-xl italic text-paper">
                Your Bag {items.length > 0 && `(${items.length})`}
              </h2>
              <button
                onClick={close}
                aria-label="Close bag"
                className="rounded-full bg-ink-soft/80 p-2 text-paper-dim backdrop-blur-sm transition-colors hover:text-paper"
              >
                <X size={16} strokeWidth={1.4} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-7 text-center">
                <p className="font-display text-lg italic text-paper">Your bag is empty.</p>
                <p className="font-sans text-[13px] text-paper-dim">
                  Twelve pieces are waiting in the archive.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-7 py-6">
                  <ul className="flex flex-col gap-6">
                    {items.map((item) => (
                      <li key={`${item.piece.id}-${item.size}`} className="flex gap-4">
                        <div className="h-24 w-20 shrink-0 overflow-hidden bg-ink-soft">
                          <img
                            src={unsplash(item.piece.image, 200)}
                            alt={item.piece.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="font-display text-base italic text-paper">
                              {item.piece.name}
                            </p>
                            <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.1em] text-paper-dim">
                              Size {item.size} {item.qty > 1 && `· Qty ${item.qty}`}
                            </p>
                          </div>
                          <p className="font-sans text-[13px] text-paper-dim">
                            ${(item.piece.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 border-t border-paper/10 px-7 py-6">
                  <div className="flex items-baseline justify-between font-sans text-[13px] uppercase tracking-[0.1em] text-paper-dim">
                    <span>Subtotal</span>
                    <span className="font-display text-lg italic normal-case tracking-normal text-paper">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <button className="w-full bg-paper py-4 font-sans text-[12px] uppercase tracking-[0.15em] text-ink transition-colors hover:bg-brass">
                    Checkout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
