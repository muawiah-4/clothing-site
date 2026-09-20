import { motion } from "motion/react";
import MagneticButton from "../components/MagneticButton";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";

export default function Contact() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="contact"
      className="scroll-mt-24 mx-3 mt-3 flex min-h-[70vh] flex-col justify-center rounded-[2rem] bg-surface-soft px-6 py-20 md:mx-6 md:mt-4 md:px-14 md:py-28"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
        <motion.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
        >
          Visit / Inquire
        </motion.p>

        <motion.h2
          {...fade(reducedMotion, { y: 20, duration: 0.9, delay: 0.1 })}
          className="mt-5 font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl md:text-7xl"
        >
          Come see
          <br />
          the atelier.
        </motion.h2>

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
            className="w-full rounded-full bg-surface px-10 py-5 font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-deep shadow-[0_16px_30px_-16px_rgba(46,42,82,0.4)] transition-transform hover:scale-[1.03] sm:w-fit"
          >
            Book an Appointment
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
