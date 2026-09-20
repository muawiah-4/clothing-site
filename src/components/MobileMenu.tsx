import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { scrollToSection } from "../lib/scroll";
import { useFocusTrap } from "../hooks/useFocusTrap";

const LINKS = [
  { id: "story", label: "House" },
  { id: "wardrobe", label: "Archive" },
  { id: "craft", label: "Craft" },
  { id: "contact", label: "Contact" },
];

/**
 * Replaces the old mobile "Menu" button, which didn't open anything — it
 * just jumped straight to Contact, leaving House/Archive/Craft unreachable
 * on mobile without manual scrolling.
 */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useFocusTrap(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-ink md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          ref={containerRef}
        >
          <div className="flex items-center justify-between px-6 py-6">
            <span className="font-display text-xl italic tracking-wide text-paper">Atelier</span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-full bg-ink-soft/80 p-2 text-paper-dim transition-colors hover:text-paper"
            >
              <X size={18} strokeWidth={1.4} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-start justify-center gap-2 px-8">
            {LINKS.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  onClose();
                  scrollToSection(link.id);
                }}
                className="py-3 font-display text-4xl italic text-paper transition-colors hover:text-brass"
              >
                {link.label}
              </motion.button>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
