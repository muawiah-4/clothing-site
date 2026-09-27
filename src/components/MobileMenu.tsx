import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { scrollToSection } from "../lib/scroll";
import { useFocusTrap } from "../hooks/useFocusTrap";
import Logo from "./Logo";

const LINKS = [
  { id: "story", label: "House" },
  { id: "wardrobe", label: "Archive" },
  { id: "craft", label: "Craft" },
  { id: "lookbook", label: "Lookbook" },
  { id: "contact", label: "Contact" },
];

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containerRef = useFocusTrap(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-surface/75 backdrop-blur-2xl md:hidden"
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
            <Logo />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-full border border-white/50 bg-surface/50 p-2 text-ink-dim backdrop-blur-md transition-colors hover:text-accent"
            >
              <X size={18} strokeWidth={1.6} />
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
                className="py-3 font-display text-4xl font-semibold text-ink transition-colors hover:text-accent"
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
