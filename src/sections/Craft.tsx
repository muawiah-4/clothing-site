import { m } from "motion/react";
import { CRAFT_IMAGES, unsplash } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";
import SplitReveal from "../components/SplitReveal";
import ShimmerImage from "../components/ShimmerImage";

const STEPS = [
  {
    num: "I",
    title: "Pattern",
    copy: "Each silhouette is drafted by hand before it is ever cut, held against a form until the proportion earns its place.",
    alt: "Dress forms and draped pattern pieces in the studio workroom",
  },
  {
    num: "II",
    title: "Cloth",
    copy: "We choose material before design — the weight and drape of a fabric decides what it is allowed to become.",
    alt: "Two tailors working fabric together at a cutting table",
  },
  {
    num: "III",
    title: "Hand",
    copy: "Every seam is finished by the same small team that drafted it. Nothing leaves the studio unseen.",
    alt: "Close detail of hand-finished stitching in progress",
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
        <m.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
        >
          Process
        </m.p>
        <SplitReveal
          as="h2"
          text="Three steps. No shortcuts."
          className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
        />

        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <m.div
              key={step.num}
              {...fade(reducedMotion, { y: 24, duration: 0.7, delay: i * 0.1 })}
            >
              {/* surface-dim + ShimmerImage: the bare motion.img flashed a
                  white box until the photo arrived */}
              <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface-dim">
                <m.div
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
                  className="h-full w-full"
                >
                  <ShimmerImage
                    src={unsplash(CRAFT_IMAGES[i], 700)}
                    alt={step.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </m.div>
              </div>
              <p className="mt-6 font-display text-xl font-bold text-accent-deep">{step.num}</p>
              <h3 className="mt-1 font-sans text-[13px] font-semibold uppercase tracking-[0.15em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 font-sans text-[14px] leading-relaxed text-ink-dim">
                {step.copy}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
