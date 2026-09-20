const EASE = [0.22, 1, 0.36, 1] as const;

interface FadeOpts {
  y?: number;
  x?: number;
  duration?: number;
  delay?: number;
  margin?: string;
}

/**
 * Shared scroll-reveal preset. Every section was independently hand-rolling
 * the same whileInView fade+slide with its own literal duration/delay, which
 * is how prefers-reduced-motion silently only got wired into two of six
 * sections — Motion's own animation engine ignores the CSS media-query
 * override, so each usage has to check the store flag itself.
 */
export function fade(reducedMotion: boolean, opts: FadeOpts = {}) {
  const { y, x, duration = 0.8, delay = 0, margin = "-10%" } = opts;

  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true },
      transition: { duration: 0.15, delay: 0 },
    };
  }

  return {
    initial: { opacity: 0, y, x },
    whileInView: { opacity: 1, y: 0, x: 0 },
    viewport: { once: true, margin },
    transition: { duration, delay, ease: EASE },
  };
}

/** Same idea as `fade`, for the immediate (non-scroll-triggered) entrance beats. */
export function enter(reducedMotion: boolean, opts: FadeOpts = {}) {
  const { y, x, duration = 0.9, delay = 0 } = opts;

  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15, delay: 0 },
    };
  }

  return {
    initial: { opacity: 0, y, x },
    animate: { opacity: 1, y: 0, x: 0 },
    transition: { duration, delay, ease: EASE },
  };
}
