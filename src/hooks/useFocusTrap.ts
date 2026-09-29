import { useEffect, useRef } from "react";
import { lockScroll, unlockScroll } from "../lib/scroll";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Moves focus into a panel on open, cycles Tab/Shift+Tab within it, and
 * restores focus to whatever triggered it on close — none of the site's
 * overlays (buy panel, bag, mobile menu) had this, so a keyboard user lost
 * their place in the page every time one closed.
 */
export function useFocusTrap(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    const container = containerRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const items = container.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lockScroll();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      unlockScroll();
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  return containerRef;
}
