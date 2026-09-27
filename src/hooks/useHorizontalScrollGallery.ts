import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

// The ScrollTrigger plugin is already registered once in useSmoothScroll.ts
// (gsap.registerPlugin(ScrollTrigger)) — that's a one-time, app-wide
// registration, so it doesn't need to be imported or re-registered here for
// the `scrollTrigger` tween config below to work.

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
 */
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

    const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: viewport,
        start: "top top",
        end: () => "+=" + getDistance(),
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

    return () => {
      // Kill the ScrollTrigger first (removes the pin-spacer and any inline
      // fixed-position styles it applied) before killing the tween itself,
      // both on unmount and before this effect re-runs (e.g. reducedMotion
      // flips true at runtime).
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [enabled, viewportRef, trackRef]);
}
