import type Lenis from "lenis";
import { sectionsMounted, whenSectionsMounted } from "./lazySections";

let lenisInstance: Lenis | null = null;
// how many overlays (preloader, modals) currently hold the page still — Lenis
// hijacks wheel input itself, so body overflow:hidden alone doesn't stop it
let lockCount = 0;
let pendingScroll: { id: string; duration: number } | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
  // the preloader locks before App's Lenis effect has created the instance
  if (instance && lockCount > 0) instance.stop();
}

export function lockScroll() {
  lockCount += 1;
  lenisInstance?.stop();
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  lenisInstance?.start();
  // a nav action fired from inside an overlay (e.g. a menu link) runs before
  // the overlay's lock is released — Lenis ignores scrollTo while stopped,
  // so it's replayed here once scrolling is live again
  if (pendingScroll) {
    const { id, duration } = pendingScroll;
    pendingScroll = null;
    scrollToSection(id, duration);
  }
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

export function scrollToSection(id: string, duration = 1.6) {
  if (lockCount > 0) {
    pendingScroll = { id, duration };
    return;
  }
  // below-the-fold sections are lazy chunks: until they have all mounted the
  // target may be missing or sit above placeholders whose height is only an
  // estimate, so wait for the final layout before measuring
  if (!sectionsMounted()) {
    pendingScroll = { id, duration };
    void whenSectionsMounted().then(() => {
      if (pendingScroll?.id !== id || lockCount > 0) return;
      pendingScroll = null;
      scrollToSection(id, duration);
    });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = lenisInstance;
  pendingScroll = null;
  if (lenis) {
    lenis.scrollTo(el, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    // no Lenis (reduced motion, or it hasn't loaded yet): native scroll,
    // instant when the visitor asked for reduced motion
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
}
