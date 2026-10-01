import { m } from "motion/react";
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
      className="glass-card scroll-mt-24 mt-3 px-6 py-24 md:mt-4 md:px-14 md:py-40"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <m.div
            {...fade(reducedMotion, { y: 20, duration: 0.9 })}
            className="aspect-[3/4] overflow-hidden rounded-card"
          >
            <ShimmerImage
              src={unsplash(PORTRAIT_IMAGE, 900)}
              alt="Studio portrait"
              className="grade-editorial h-full w-full object-cover"
            />
          </m.div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <m.p
            {...fade(reducedMotion, { y: 16, duration: 0.7 })}
            className="font-sans text-label-xs font-semibold uppercase text-accent-deep"
          >
            The House
          </m.p>

          <SplitReveal
            as="h2"
            text="Atelier began as a single room and a refusal to rush."
            className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
          />

          <div className="mt-8 flex flex-col gap-5 font-sans text-base leading-relaxed text-ink-dim">
            <m.p {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.2 })}>
              We work from a small studio, not a factory floor. Every collection is small by
              intention — a dozen pieces, each one argued over, unpicked, and re-cut until the
              proportion holds.
            </m.p>
            <m.p {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.3 })}>
              Materials are chosen before silhouettes are drawn — the cloth tells us what it wants
              to become. What we build is meant to be worn for a decade, not a season.
            </m.p>
          </div>

          <m.blockquote
            {...fade(reducedMotion, { y: 14, duration: 0.8, delay: 0.35 })}
            className="mt-8 rounded-soft border border-white/40 bg-surface/40 px-6 py-5 font-display text-lg font-medium leading-snug text-ink backdrop-blur-md"
          >
            "We do not chase trend. We chase the garment that still feels correct in ten years."
          </m.blockquote>

          <m.div
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
                <p className="mt-1 font-sans text-label-xs uppercase text-ink-dim">
                  {label}
                </p>
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
}
