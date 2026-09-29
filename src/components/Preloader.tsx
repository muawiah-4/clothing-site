import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useExperienceStore } from "../store/experience";

/**
 * A brief, deliberate first moment before the site is handed over — a dark
 * "spotlight" curtain (the same token used for the wardrobe reveal) with the
 * mark and a counted percentage, then a bottom-up wipe that reveals the
 * light gradient canvas underneath. Skipped entirely for reduced-motion.
 */
export default function Preloader() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(() => reducedMotion);
  const finished = done || reducedMotion;

  useEffect(() => {
    // reduced-motion can flip on after mount (or mid-sequence) — `finished`
    // below then drops the curtain and the effect under this one unlocks scroll.
    // Once done, never re-lock (e.g. the preference flipping back off later).
    if (reducedMotion || done) return;

    document.body.style.overflow = "hidden";
    const duration = 1300;
    const start = performance.now();
    let raf = 0;
    let timeout = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timeout = window.setTimeout(() => setDone(true), 200);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [reducedMotion, done]);

  useEffect(() => {
    if (finished) document.body.style.overflow = "";
  }, [finished]);

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-spotlight"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <motion.svg
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            width="52"
            height="52"
            viewBox="0 0 48 48"
          >
            <defs>
              <linearGradient id="preloader-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#b9c5f2" />
                <stop offset="0.55" stopColor="#cbb7e6" />
                <stop offset="1" stopColor="#f2c6d8" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="14" fill="url(#preloader-g)" />
            <path
              d="M24 11 34 37h-5.2l-2-5.4H21.2l-2 5.4H14L24 11Zm0 8.6-3 8.2h6l-3-8.2Z"
              fill="#ffffff"
            />
          </motion.svg>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-surface/70">
            Atelier
          </p>
          <p className="font-display text-3xl font-semibold text-surface">{progress}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
