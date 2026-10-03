import { useEffect, useRef } from "react";
import { getTrigger } from "../lib/focusTrigger";
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
  const triggerRef = useRef<HTMLElement | null>(null);
  // callers pass inline close fns (a new identity every render) — keep the
  // latest one in a ref so the trap only re-runs when `open` changes, instead
  // of re-focusing the first element and re-locking scroll on every render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = getTrigger();

    const container = containerRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.closest('[hidden], [inert], [aria-hidden="true"]'),
      );
      if (items.length === 0) return;
      // Move focus ourselves on every Tab rather than only wrapping at the
      // ends: Safari's default Tab skips buttons and links, so it would jump
      // past the "last" item straight out of the panel.
      e.preventDefault();
      const at = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (at <= 0 ? items.length - 1 : at - 1) : at === -1 || at === items.length - 1 ? 0 : at + 1;
      items[next].focus();
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lockScroll();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      unlockScroll();
      const trigger = triggerRef.current;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);

  return containerRef;
}
