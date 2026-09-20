import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { unsplash } from "../data/collection";
import { scrollToSection } from "../lib/scroll";
import { useExperienceStore } from "../store/experience";
import { enter, fade } from "../lib/motion";

const EDITORIAL_IMAGE = unsplash(
  "https://images.unsplash.com/photo-1659522761084-79196b64abe4",
  1400,
);
const MANIFESTO_IMAGE = unsplash(
  "https://images.unsplash.com/photo-1779810677455-449ae4ee2bc7",
  1600,
);

export default function Hero() {
  return (
    <div id="top">
      <OpeningBeat />
      <EditorialBeat />
      <ManifestoBeat />
    </div>
  );
}

/**
 * Beat 1 — the opening curtain. Previously a perfectly centered headline on
 * an evenly-centered vignette, which is the one composition every fashion
 * hero on Awwwards has already used. The off-axis glow, side index rail,
 * and left-leaning headline turn it into the same asymmetric, editorial
 * language the rest of the site uses, while keeping the cursor-reactive feel.
 */
function OpeningBeat() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20 });
  const springY = useSpring(my, { stiffness: 60, damping: 20 });
  const rotate = useTransform(springX, [-0.5, 0.5], [-1.4, 1.4]);
  const skew = useTransform(springX, [-0.5, 0.5], [-2.2, 2.2]);
  const shiftY = useTransform(springY, [-0.5, 0.5], [-8, 8]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width - 0.5);
      my.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <section
      ref={ref}
      className="relative flex h-screen flex-col justify-center overflow-hidden bg-ink px-6 md:px-12"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 28% 62%, rgba(182,144,90,0.18) 0%, transparent 70%)",
        }}
      />

      {/* side index rail — a small editorial-spread convention that also
          breaks the dead-centered symmetry of the composition */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 md:right-12 md:flex">
        <span className="h-16 w-px bg-paper-dim/40" />
        <span
          className="font-sans text-[10px] uppercase tracking-[0.3em] text-paper-dim"
          style={{ writingMode: "vertical-rl" }}
        >
          N° 01 — Opening
        </span>
      </div>

      <motion.p
        {...enter(reducedMotion, { y: 12, duration: 0.9 })}
        className="relative font-sans text-[11px] uppercase tracking-[0.35em] text-paper-dim md:text-left"
      >
        Atelier — Est. Considered
      </motion.p>

      <motion.h1
        style={reducedMotion ? undefined : { rotate, skewX: skew, y: shiftY }}
        {...enter(reducedMotion, { y: 40, duration: 1.1, delay: 0.15 })}
        className="relative mt-6 text-center font-display text-[15vw] italic leading-[0.92] tracking-tight text-paper sm:text-[13vw] md:text-left md:text-[10vw]"
      >
        Form in
        <br />
        Material.
      </motion.h1>

      <motion.div
        {...enter(reducedMotion, { duration: 1, delay: 0.6 })}
        className="relative mt-10 flex flex-col items-center gap-3 md:items-start"
      >
        <button
          onClick={() => scrollToSection("story")}
          className="font-sans text-[11px] uppercase tracking-[0.25em] text-paper-dim transition-colors hover:text-paper"
        >
          Scroll to Enter
        </button>
        <span className="h-10 w-px animate-pulse bg-paper-dim" />
      </motion.div>
    </section>
  );
}

/** Beat 2 — asymmetric editorial spread. Image bleeds right, type anchors left. */
function EditorialBeat() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink py-24">
      <div className="grid w-full grid-cols-1 items-center gap-10 px-6 md:grid-cols-12 md:gap-4 md:px-10">
        <div className="order-2 md:order-1 md:col-span-5">
          <motion.p
            {...fade(reducedMotion, { x: -20, duration: 0.8 })}
            className="font-sans text-[11px] uppercase tracking-[0.3em] text-brass"
          >
            Chapter One
          </motion.p>
          <motion.h2
            {...fade(reducedMotion, { x: -20, duration: 0.9, delay: 0.1 })}
            className="mt-5 font-display text-5xl italic leading-[1.02] text-paper sm:text-6xl md:text-7xl"
          >
            Cut to
            <br />
            outlast
            <br />
            the season.
          </motion.h2>
          <motion.p
            {...fade(reducedMotion, { x: -20, duration: 0.8, delay: 0.2 })}
            className="mt-8 max-w-sm font-sans text-[15px] leading-relaxed text-paper-dim"
          >
            Every silhouette begins as a question of proportion, held against the body until it
            earns its place. Nothing is decorative. Everything is deliberate.
          </motion.p>
        </div>

        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
          whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={reducedMotion ? { duration: 0.15 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 col-span-1 aspect-[4/5] overflow-hidden md:order-2 md:col-span-7 md:aspect-auto md:h-[78vh] md:translate-x-6"
        >
          <img
            src={EDITORIAL_IMAGE}
            alt="Ivory tailleur, studio portrait"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

/** Beat 3 — full-bleed pull-quote over a moody portrait, magazine-spread style. */
function ManifestoBeat() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  return (
    <section className="relative flex h-screen items-end overflow-hidden bg-ink">
      <img
        src={MANIFESTO_IMAGE}
        alt="Sculpted form, studio"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />

      <div className="relative z-10 w-full px-6 pb-20 md:px-10 md:pb-24">
        <motion.blockquote
          {...fade(reducedMotion, { y: 24, duration: 1 })}
          className="max-w-4xl font-display text-3xl italic leading-[1.15] text-paper sm:text-5xl md:text-6xl"
        >
          "We do not chase trend. We chase the garment that still feels correct in ten years."
        </motion.blockquote>
        <motion.p
          {...fade(reducedMotion, { duration: 0.8, delay: 0.3 })}
          className="mt-8 font-sans text-[11px] uppercase tracking-[0.3em] text-paper-dim"
        >
          — Studio Note, No. 12
        </motion.p>
      </div>
    </section>
  );
}
