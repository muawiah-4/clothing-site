import { motion } from "motion/react";
import { CRAFT_IMAGES, unsplash } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";

const STEPS = [
  {
    num: "I",
    title: "Pattern",
    copy: "Each silhouette is drafted by hand before it is ever cut, held against a form until the proportion earns its place.",
  },
  {
    num: "II",
    title: "Cloth",
    copy: "We choose material before design — the weight and drape of a fabric decides what it is allowed to become.",
  },
  {
    num: "III",
    title: "Hand",
    copy: "Every seam is finished by the same small team that drafted it. Nothing leaves the studio unseen.",
  },
];

export default function Craft() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="craft"
      className="scroll-mt-24 mx-3 mt-3 rounded-[2rem] border border-white/40 bg-surface-soft/55 px-6 py-20 shadow-[0_24px_60px_-30px_rgba(46,42,82,0.35)] backdrop-blur-2xl md:mx-6 md:mt-4 md:px-14 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
        >
          Process
        </motion.p>
        <motion.h2
          {...fade(reducedMotion, { y: 16, duration: 0.8, delay: 0.1 })}
          className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
        >
          Three steps. No shortcuts.
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              {...fade(reducedMotion, { y: 24, duration: 0.7, delay: i * 0.1 })}
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface">
                <motion.img
                  src={unsplash(CRAFT_IMAGES[i], 700)}
                  alt={step.title}
                  loading="lazy"
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : { clipPath: "inset(0 0 0 100%)", opacity: 1 }
                  }
                  whileInView={
                    reducedMotion
                      ? { opacity: 1 }
                      : { clipPath: "inset(0 0 0 0%)", opacity: 1 }
                  }
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: reducedMotion ? 0.15 : 1,
                    delay: reducedMotion ? 0 : 0.15 + i * 0.12,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-6 font-display text-xl font-bold text-accent-deep">{step.num}</p>
              <h3 className="mt-1 font-sans text-[13px] font-semibold uppercase tracking-[0.15em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 font-sans text-[14px] leading-relaxed text-ink-dim">
                {step.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
