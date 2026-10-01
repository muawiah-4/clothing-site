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
    copy: "Every silhouette is drafted by hand in paper, then made up in calico and pinned on the form until the proportion earns its place.",
    alt: "Dress forms with chalk-marked toiles in the workroom",
    position: "35% 50%",
  },
  {
    num: "II",
    title: "Cloth",
    copy: "Cloth comes before the drawing: wool from Lanificio Sella in Biella, worsteds from Hartley & Crowther in Huddersfield. The weight and drape decide what a piece may become.",
    alt: "Close detail of a tightly woven wool cloth",
    position: "50% 50%",
  },
  {
    num: "III",
    title: "Hand",
    copy: "Théo Varenne's workroom cuts and finishes every piece on rue de Miromesnil. Nothing leaves the atelier without a last fitting on the form.",
    alt: "A tailor's hands laying out cut wool pieces on the cutting table",
    position: "50% 60%",
  },
];

export default function Craft() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="craft"
      className="glass-card scroll-mt-24 px-6 py-20 md:px-14 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <m.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-label-xs font-semibold uppercase text-accent-deep"
        >
          The Workroom
        </m.p>
        <SplitReveal
          as="h2"
          text="Three stages, one room in Paris."
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
              <div className="aspect-[4/5] overflow-hidden rounded-card bg-surface-dim">
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
                    style={{ objectPosition: step.position }}
                    className="grade-editorial h-full w-full object-cover"
                  />
                </m.div>
              </div>
              <p className="mt-6 font-display text-xl font-bold text-accent-deep">{step.num}</p>
              <h3 className="mt-1 font-sans text-label-sm font-semibold uppercase text-ink">
                {step.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-dim">
                {step.copy}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
