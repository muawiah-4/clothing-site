import { motion } from "motion/react";
import { PORTRAIT_IMAGE, unsplash } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";
import ShimmerImage from "../components/ShimmerImage";
import SplitReveal from "../components/SplitReveal";

export default function BrandStory() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="story"
      className="scroll-mt-24 mx-3 mt-3 rounded-[2rem] border border-white/40 bg-surface/55 px-6 py-20 shadow-[0_24px_60px_-30px_rgba(46,42,82,0.35)] backdrop-blur-2xl md:mx-6 md:mt-4 md:px-14 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <motion.div
            {...fade(reducedMotion, { y: 20, duration: 0.9 })}
            className="aspect-[3/4] overflow-hidden rounded-[1.75rem]"
          >
            <ShimmerImage
              src={unsplash(PORTRAIT_IMAGE, 900)}
              alt="Studio portrait"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <motion.p
            {...fade(reducedMotion, { y: 16, duration: 0.7 })}
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
          >
            The House
          </motion.p>

          <SplitReveal
            as="h2"
            text="Atelier began as a single room and a refusal to rush."
            className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
          />

          <div className="mt-8 flex flex-col gap-5 font-sans text-[15px] leading-relaxed text-ink/70">
            <motion.p {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.2 })}>
              We work from a small studio, not a factory floor. Every collection is small by
              intention — a dozen pieces, each one argued over, unpicked, and re-cut until the
              proportion holds.
            </motion.p>
            <motion.p {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.3 })}>
              Materials are chosen before silhouettes are drawn — the cloth tells us what it wants
              to become. What we build is meant to be worn for a decade, not a season.
            </motion.p>
          </div>

          <motion.blockquote
            {...fade(reducedMotion, { y: 14, duration: 0.8, delay: 0.35 })}
            className="mt-8 rounded-2xl border border-white/40 bg-surface/40 px-6 py-5 font-display text-lg font-medium leading-snug text-ink backdrop-blur-md"
          >
            "We do not chase trend. We chase the garment that still feels correct in ten years."
          </motion.blockquote>

          <motion.div
            {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.45 })}
            className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8"
          >
            {[
              ["12", "Pieces per collection"],
              ["1", "Studio, one city"],
              ["No end date", "Seasons intended"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-xl font-bold text-accent-deep sm:text-2xl">
                  {stat}
                </p>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.1em] text-ink-dim">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
