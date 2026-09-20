import { motion } from "motion/react";
import MagneticButton from "../components/MagneticButton";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";

export default function Contact() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="contact"
      className="scroll-mt-24 flex min-h-screen flex-col justify-center bg-ink px-6 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
        <motion.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[11px] uppercase tracking-[0.3em] text-brass"
        >
          Visit / Inquire
        </motion.p>

        <motion.h2
          {...fade(reducedMotion, { y: 20, duration: 0.9, delay: 0.1 })}
          className="mt-6 font-display text-5xl italic leading-[1.02] text-paper sm:text-7xl md:text-8xl"
        >
          Come see
          <br />
          the atelier.
        </motion.h2>

        <motion.div
          {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.3 })}
          className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-1 font-sans text-[14px] text-paper-dim">
            <a href="mailto:studio@atelier.house" className="w-fit transition-colors hover:text-paper">
              studio@atelier.house
            </a>
            <a href="tel:+33142960112" className="w-fit transition-colors hover:text-paper">
              +33 1 42 96 01 12
            </a>
            <p className="mt-2">By appointment · 8th Arrondissement, Paris</p>
          </div>

          <MagneticButton
            strength={0.15}
            className="w-full border border-paper/30 px-10 py-5 font-sans text-[11px] uppercase tracking-[0.25em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink sm:w-fit"
          >
            Book an Appointment
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
