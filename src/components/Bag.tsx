import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Check, Minus, Plus, X } from "lucide-react";
import { useExperienceStore } from "../store/experience";
import { unsplash } from "../data/collection";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { scrollToSection } from "../lib/scroll";
import ShimmerImage from "./ShimmerImage";
import { formatPrice } from "../lib/format";

/**
 * The "Add to Bag" payoff — previously the bag count lived only in the
 * store and was never rendered anywhere, so adding an item had no visible,
 * lasting consequence. This gives it a real destination.
 */
export default function Bag() {
  const open = useExperienceStore((s) => s.bagOpen);
  const setOpen = useExperienceStore((s) => s.setBagOpen);
  const items = useExperienceStore((s) => s.bagItems);
  const clearBag = useExperienceStore((s) => s.clearBag);
  const setQty = useExperienceStore((s) => s.setQty);
  const removeFromBag = useExperienceStore((s) => s.removeFromBag);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [placed, setPlaced] = useState(false);
  const close = () => setOpen(false);
  const containerRef = useFocusTrap(open, close);
  const placedHeadingRef = useRef<HTMLHeadingElement>(null);

  // Checkout unmounts the button that had focus when the bag swaps to the
  // confirmation view, which drops focus to <body>. Move it to the
  // confirmation heading so keyboard and screen-reader users land on (and
  // hear) the result instead of losing their place.
  useEffect(() => {
    if (placed) placedHeadingRef.current?.focus();
  }, [placed]);

  const total = items.reduce((sum, i) => sum + i.piece.price * i.qty, 0);
  // units, not lines — matches the Navbar badge
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    // reset the confirmation only once the panel has fully left, whichever
    // way it was closed (X, Esc, backdrop, Continue Browsing), so the next
    // open shows the bag rather than a stale "Demo order placed"
    <AnimatePresence onExitComplete={() => setPlaced(false)}>
      {open && (
        <m.div
          className="fixed inset-0 z-[85] flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Your bag"
        >
          <m.button
            aria-label="Close bag"
            className="absolute inset-0 bg-ink/30 max-md:bg-ink/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.3 }}
            onClick={close}
          />
          <m.div
            ref={containerRef}
            className="relative flex h-full w-full max-w-md flex-col rounded-l-[2rem] border-l border-white/40 bg-surface/70 max-md:bg-surface/95 backdrop-blur-2xl"
            initial={{ x: reducedMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reducedMotion ? 0 : "100%" }}
            transition={{ duration: reducedMotion ? 0.05 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-7 py-6">
              <h2 className="font-display text-xl font-bold text-ink">
                Your Bag {count > 0 && `(${count})`}
              </h2>
              <button
                onClick={close}
                aria-label="Close bag"
                className="rounded-full border border-white/50 bg-surface/60 p-2 text-ink-dim backdrop-blur-md transition-colors hover:text-accent-deep"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>

            {placed ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-7 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface">
                  <Check size={22} strokeWidth={2} />
                </span>
                <h3
                  ref={placedHeadingRef}
                  tabIndex={-1}
                  className="font-display text-lg font-semibold text-ink"
                >
                  Demo order placed.
                </h3>
                <p className="max-w-xs font-sans text-[13px] text-ink-dim">
                  This is a demo storefront: no payment was taken, no order was sent, and
                  nothing will ship. Your bag has been cleared.
                </p>
                <button
                  onClick={close}
                  className="mt-4 rounded-full bg-accent px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-surface transition-colors hover:bg-accent-deep"
                >
                  Continue Browsing
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-7 text-center">
                <p className="font-display text-lg font-semibold text-ink">Your bag is empty.</p>
                <p className="font-sans text-[13px] text-ink-dim">
                  Twelve pieces are waiting in the archive.
                </p>
                <button
                  onClick={() => {
                    close();
                    // deferred by lib/scroll until the bag releases its scroll lock
                    scrollToSection("collection");
                  }}
                  className="mt-4 rounded-full bg-accent px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-surface transition-colors hover:bg-accent-deep"
                >
                  Shop the collection
                </button>
              </div>
            ) : (
              <>
                <div data-lenis-prevent className="flex-1 overflow-y-auto px-7 py-6">
                  <ul className="flex flex-col gap-6">
                    {items.map((item) => (
                      <li key={`${item.piece.id}-${item.size}`} className="flex gap-4">
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                          <ShimmerImage
                            src={unsplash(item.piece.image, 200)}
                            alt={item.piece.name}
                            style={{ objectPosition: item.piece.objectPosition }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="font-display text-base font-semibold text-ink">
                              {item.piece.name}
                            </p>
                            <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.1em] text-ink-dim">
                              Size {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-ink/15">
                              <button
                                onClick={() => setQty(item.piece.id, item.size, item.qty - 1)}
                                aria-label={`Decrease quantity of ${item.piece.name}, size ${item.size}`}
                                className="p-1.5 text-ink-dim transition-colors hover:text-accent-deep"
                              >
                                <Minus size={12} strokeWidth={1.8} />
                              </button>
                              <span
                                aria-live="polite"
                                className="min-w-[1.5rem] text-center font-sans text-[12px] text-ink"
                              >
                                {item.qty}
                              </span>
                              <button
                                onClick={() => setQty(item.piece.id, item.size, item.qty + 1)}
                                aria-label={`Increase quantity of ${item.piece.name}, size ${item.size}`}
                                className="p-1.5 text-ink-dim transition-colors hover:text-accent-deep"
                              >
                                <Plus size={12} strokeWidth={1.8} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromBag(item.piece.id, item.size)}
                              aria-label={`Remove ${item.piece.name}, size ${item.size}`}
                              className="font-sans text-[11px] uppercase tracking-[0.1em] text-ink-dim underline-offset-2 transition-colors hover:text-accent-deep hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="font-sans text-[13px] font-medium text-accent-deep">
                            {formatPrice(item.piece.price * item.qty)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 border-t border-ink/10 px-7 py-6">
                  <div className="flex items-baseline justify-between font-sans text-[13px] uppercase tracking-[0.1em] text-ink-dim">
                    <span>Subtotal</span>
                    <span className="font-display text-lg font-bold normal-case tracking-normal text-ink">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      clearBag();
                      setPlaced(true);
                    }}
                    aria-describedby="bag-demo-note"
                    className="w-full rounded-full bg-accent py-4 font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-surface transition-colors hover:bg-accent-deep"
                  >
                    Place demo order
                  </button>
                  {/* the checkout collects no payment or delivery details and
                      sends nothing anywhere; say so before the click, not only
                      after it (CWE-451: don't imply a real purchase) */}
                  <p
                    id="bag-demo-note"
                    className="text-center font-sans text-[11px] leading-relaxed text-ink-dim"
                  >
                    Demo storefront: no payment is taken and no order is sent.
                  </p>
                </div>
              </>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
