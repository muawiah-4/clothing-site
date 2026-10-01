import { m } from "motion/react";
import MagneticButton from "../components/MagneticButton";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";
import SplitReveal from "../components/SplitReveal";

export default function Contact() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="contact"
      className="glass-card scroll-mt-24 flex min-h-[70vh] flex-col justify-center px-6 py-28 md:px-14 md:py-40"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
        <m.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-label-xs font-semibold uppercase text-accent-deep"
        >
          Fittings by appointment
        </m.p>

        <SplitReveal
          as="h2"
          text="Come see the atelier."
          className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl md:text-7xl"
        />

        <m.div
          {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.3 })}
          className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-1 font-sans text-sm text-ink-dim">
            <a href="mailto:studio@atelier.house" className="w-fit transition-colors hover:text-accent-deep">
              studio@atelier.house
            </a>
            <a href="tel:+33142960112" className="w-fit transition-colors hover:text-accent-deep">
              +33 1 42 96 01 12
            </a>
            <p className="mt-2">14 rue de Miromesnil, 75008 Paris · Tuesday to Saturday</p>
          </div>

          {/* was a button with no handler; now a real mailto: to the studio
              address shown alongside it */}
          <MagneticButton
            href="mailto:studio@atelier.house?subject=Appointment%20request"
            strength={0.15}
            className="inline-flex w-full justify-center rounded-full border border-white/50 bg-surface/50 px-10 py-5 font-sans text-label-sm font-semibold uppercase text-accent-deep shadow-float backdrop-blur-xl transition-transform hover:scale-[1.03] hover:bg-surface/70 sm:w-fit"
          >
            Book an Appointment
          </MagneticButton>
        </m.div>
      </div>
    </section>
  );
}
