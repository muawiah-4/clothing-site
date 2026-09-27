import { motion } from "motion/react";
import MagneticButton from "../components/MagneticButton";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";
import SplitReveal from "../components/SplitReveal";

export default function Contact() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="contact"
      className="scroll-mt-24 mx-3 mt-3 flex min-h-[70vh] flex-col justify-center rounded-[2rem] border border-white/40 bg-surface-soft/55 px-6 py-20 shadow-[0_24px_60px_-30px_rgba(46,42,82,0.35)] backdrop-blur-2xl md:mx-6 md:mt-4 md:px-14 md:py-28"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
        <motion.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
        >
          Visit / Inquire
        </motion.p>

        <SplitReveal
          as="h2"
          text="Come see the atelier."
          className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl md:text-7xl"
        />

        <motion.div
          {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.3 })}
          className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-1 font-sans text-[14px] text-ink-dim">
            <a href="mailto:studio@atelier.house" className="w-fit transition-colors hover:text-accent-deep">
              studio@atelier.house
            </a>
            <a href="tel:+33142960112" className="w-fit transition-colors hover:text-accent-deep">
              +33 1 42 96 01 12
            </a>
            <p className="mt-2">By appointment · 8th Arrondissement, Paris</p>
          </div>

          <MagneticButton
            strength={0.15}
            className="w-full rounded-full border border-white/50 bg-surface/50 px-10 py-5 font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-deep shadow-[0_16px_30px_-16px_rgba(46,42,82,0.4)] backdrop-blur-xl transition-transform hover:scale-[1.03] hover:bg-surface/70 sm:w-fit"
          >
            Book an Appointment
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
