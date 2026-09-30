import { useEffect } from "react";
import { setLenisInstance } from "../lib/scroll";

/**
 * Lenis drives the scroll physics; GSAP's ticker drives Lenis's rAF loop and
 * ScrollTrigger is told to re-measure on every Lenis tick. This is the
 * standard Lenis+GSAP wiring — without it ScrollTrigger's own scroll
 * listener and Lenis's virtual scroll position drift apart.
 *
 * Lenis and GSAP are imported on demand so neither sits in the entry chunk:
 * native scrolling works from the first frame and smoothing takes over as
 * soon as the libraries arrive.
 */
export function useSmoothScroll(enabled: boolean, reducedMotion: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    void Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          duration: reducedMotion ? 0.4 : 1.1,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          smoothWheel: !reducedMotion,
          touchMultiplier: 1.3,
        });
        setLenisInstance(lenis);

        lenis.on("scroll", ScrollTrigger.update);

        const tick = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Lenis caches the scroll limit and re-measures from a ResizeObserver
        // on <html>, which never fires here (html is height:100%). Lazy
        // sections, font swaps and the Lookbook pin-spacer all grow the page
        // after Lenis starts, so watch the app's own (natural-height) wrapper
        // instead — otherwise scrollTo() clamps to a stale, too-short limit.
        const content = document.getElementById("root")?.firstElementChild ?? document.body;
        const resizeObserver = new ResizeObserver(() => lenis.resize());
        resizeObserver.observe(content);

        teardown = () => {
          resizeObserver.disconnect();
          gsap.ticker.remove(tick);
          setLenisInstance(null);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [enabled, reducedMotion]);
}
