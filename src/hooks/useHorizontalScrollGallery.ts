import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// useSmoothScroll registers ScrollTrigger too, but it loads GSAP lazily and
// may not have run yet when the Lookbook mounts — registering is idempotent.
gsap.registerPlugin(ScrollTrigger);

/**
 * Pins `viewportRef`'s element in place while scrubbing `trackRef`'s element
 * horizontally to scroll progress — the classic Awwwards "pinned horizontal
 * gallery" pattern. Continued vertical wheel/scroll input drives the track's
 * translateX until its overflow width has been fully traversed, at which
 * point the pin releases and normal vertical scroll resumes.
 *
 * A no-op whenever `enabled` is false, so callers can gate this off
 * `reducedMotion` and render a plain, un-pinned layout instead — horizontal
 * scroll-jacking is exactly the kind of motion `prefers-reduced-motion`
 * users are opting out of.
 *
 * Only pins on wide screens with a fine pointer (PIN_QUERY, via
 * gsap.matchMedia so it sets up / tears down as the query flips). On touch
 * devices and narrow screens the pin is expensive and fights native touch
 * scrolling; there the row is a native horizontal scroll-snap strip instead
 * (`.lookbook-row` in index.css uses the inverse of the same query).
 */
export const PIN_QUERY = "(min-width: 48rem) and (pointer: fine)";

export function useHorizontalScrollGallery(
  viewportRef: RefObject<HTMLDivElement | null>,
  trackRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const mm = gsap.matchMedia();
    mm.add(PIN_QUERY, () => pinGallery(viewport, track));
    return () => mm.revert();
  }, [enabled, viewportRef, trackRef]);
}

/** page scroll per pixel of horizontal travel while pinned */
const SCROLL_RATIO = 0.6;

function pinGallery(viewport: HTMLDivElement, track: HTMLDivElement) {
  const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  const tween = gsap.to(track, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: viewport,
      start: "top top",
      // the track travels its full overflow over ~60% as much page scroll,
      // so the pin holds the page for a shorter stretch
      end: () => "+=" + Math.round(getDistance() * SCROLL_RATIO),
      pin: true,
      // the section this lives in has backdrop-blur (backdrop-filter),
      // which makes it a new containing block for position:fixed
      // descendants — GSAP's default fixed-position pinning then
      // computes coordinates relative to that ancestor instead of the
      // real viewport, so the pinned track renders off-screen. Pinning
      // via a transform instead sidesteps that entirely.
      pinType: "transform",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  // Content above the pin can change height after mount (e.g. the Collection
  // filter adding/removing cards), which leaves the pin's cached start/end
  // stale. Re-measure whenever <main>'s height actually changes, debounced
  // so a layout animation settles before ScrollTrigger recomputes.
  const main = viewport.closest("main") ?? document.body;
  let lastHeight = main.getBoundingClientRect().height;
  let refreshTimer = 0;
  const resizeObserver = new ResizeObserver(() => {
    const height = main.getBoundingClientRect().height;
    if (Math.abs(height - lastHeight) < 1) return;
    lastHeight = height;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  });
  resizeObserver.observe(main);

  return () => {
    resizeObserver.disconnect();
    window.clearTimeout(refreshTimer);
    // Kill the ScrollTrigger first (removes the pin-spacer and any inline
    // fixed-position styles it applied) before killing the tween itself,
    // both on unmount and before this effect re-runs (e.g. reducedMotion
    // flips true at runtime).
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
