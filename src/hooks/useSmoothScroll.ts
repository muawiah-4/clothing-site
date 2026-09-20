import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenisInstance } from "../lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis drives the scroll physics; GSAP's ticker drives Lenis's rAF loop and
 * ScrollTrigger is told to re-measure on every Lenis tick. This is the
 * standard Lenis+GSAP wiring — without it ScrollTrigger's own scroll
 * listener and Lenis's virtual scroll position drift apart.
 */
export function useSmoothScroll(enabled: boolean, reducedMotion: boolean) {
  useEffect(() => {
    if (!enabled) return;

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

    return () => {
      gsap.ticker.remove(tick);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, [enabled, reducedMotion]);
}
