import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useExperienceStore } from "../store/experience";
import { lockScroll, unlockScroll } from "../lib/scroll";

const SEEN_KEY = "atelier:preloader-seen";
// count + hold + exit wipe together stay at ~600ms, so the curtain never
// holds back the hero for longer than a beat
const COUNT_MS = 280;
const HOLD_MS = 40;
const EXIT_S = 0.28;

function seenThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // storage blocked (privacy mode, sandboxed iframe) — treat as a first visit
    return false;
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore: worst case the curtain plays again on the next load
  }
}

/**
 * A brief, deliberate first moment before the site is handed over — a dark
 * "spotlight" curtain (the same token used for the wardrobe reveal) with the
 * mark and a counted percentage, then a bottom-up wipe that reveals the
 * light gradient canvas underneath. Shown once per browser session (~600ms
 * total including the wipe) and skipped entirely for reduced-motion.
 */
export default function Preloader() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(() => reducedMotion || seenThisSession());
  const finished = done || reducedMotion;

  useEffect(() => {
    // reduced-motion can flip on after mount (or mid-sequence) — `finished`
    // below then drops the curtain and the effect under this one unlocks scroll.
    // Once done, never re-lock (e.g. the preference flipping back off later).
    if (reducedMotion || done) return;

    markSeen();
    document.body.style.overflow = "hidden";
    lockScroll();
    const duration = COUNT_MS;
    const start = performance.now();
    let raf = 0;
    let timeout = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timeout = window.setTimeout(() => setDone(true), HOLD_MS);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      unlockScroll();
    };
  }, [reducedMotion, done]);

  useEffect(() => {
    if (finished) document.body.style.overflow = "";
  }, [finished]);

  return (
    <AnimatePresence>
      {!finished && (
        <m.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-spotlight"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: EXIT_S, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <m.svg
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            width="52"
            height="52"
            viewBox="0 0 48 48"
          >
            <defs>
              <linearGradient id="preloader-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0" className="[stop-color:var(--color-canvas-a)]" />
                <stop offset="0.55" className="[stop-color:var(--color-canvas-b)]" />
                <stop offset="1" className="[stop-color:var(--color-canvas-c)]" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="14" fill="url(#preloader-g)" />
            <path
              d="M24 11 34 37h-5.2l-2-5.4H21.2l-2 5.4H14L24 11Zm0 8.6-3 8.2h6l-3-8.2Z"
              className="fill-surface"
            />
          </m.svg>
          <p className="font-sans text-label-xs font-semibold uppercase text-surface/70">
            Atelier
          </p>
          <p className="font-display text-3xl font-semibold text-surface">{progress}%</p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
