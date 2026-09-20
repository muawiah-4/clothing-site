import { motion } from "motion/react";
import { PORTRAIT_IMAGE, unsplash } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";

export default function BrandStory() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section id="story" className="scroll-mt-24 bg-ink px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <motion.div
            {...fade(reducedMotion, { y: 20, duration: 0.9 })}
            className="aspect-[3/4] overflow-hidden"
          >
            <img
              src={unsplash(PORTRAIT_IMAGE, 900)}
              alt="Studio portrait"
              className="h-full w-full object-cover grayscale"
            />
          </motion.div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <motion.p
            {...fade(reducedMotion, { y: 16, duration: 0.7 })}
            className="font-sans text-[11px] uppercase tracking-[0.3em] text-brass"
          >
            The House
          </motion.p>

          <motion.h2
            {...fade(reducedMotion, { y: 16, duration: 0.8, delay: 0.1 })}
            className="mt-5 font-display text-4xl italic leading-tight text-paper sm:text-5xl"
          >
            Atelier began as a
            <br />
            single room and a
            <br />
            refusal to rush.
          </motion.h2>

          <div className="mt-10 flex flex-col gap-6 font-sans text-[15px] leading-relaxed text-paper-dim">
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

          <motion.div
            {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.4 })}
            className="mt-12 grid grid-cols-3 gap-6 border-t border-paper/10 pt-8"
          >
            {[
              ["12", "Pieces per collection"],
              ["1", "Studio, one city"],
              ["No end date", "Seasons intended"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-2xl italic text-paper sm:text-3xl">{stat}</p>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.1em] text-paper-dim">
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
