import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, AtSign, Globe, Send } from "lucide-react";
import { COLLECTION, unsplash } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { enter } from "../lib/motion";

const FEATURED_IDS = ["ivory-tailleur", "grey-hour", "silhouette-iv"];
const FEATURED = FEATURED_IDS.map((id) => COLLECTION.find((p) => p.id === id)!);

export default function Hero() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const [active, setActive] = useState(0);
  const piece = FEATURED[active];

  return (
    <section
      id="top"
      className="relative mx-3 mt-3 overflow-hidden rounded-[2rem] md:mx-6 md:mt-4"
      style={{
        background:
          "linear-gradient(135deg, var(--color-canvas-a), var(--color-canvas-b) 55%, var(--color-canvas-c))",
      }}
    >
      {/* decorative line art, echoing the reference's abstract circle/arc motif */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="620" cy="420" r="230" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M100 60 Q 500 500 950 120" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M0 300 Q 420 700 1200 460" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
      </svg>

      <div className="relative grid grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:gap-6 md:px-14 md:py-24">
        <div className="flex flex-col justify-center md:col-span-6">
          <motion.p
            {...enter(reducedMotion, { y: 10, duration: 0.7 })}
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.3em] text-surface/80"
          >
            The Current Edit
          </motion.p>

          <motion.h1
            {...enter(reducedMotion, { y: 24, duration: 0.8, delay: 0.1 })}
            className="mt-5 font-display leading-[1.05] text-ink"
          >
            <span className="block text-4xl font-normal sm:text-5xl md:text-6xl">
              Considered pieces,
            </span>
            <span className="block text-4xl font-extrabold sm:text-5xl md:text-6xl">
              made to outlast trend.
            </span>
          </motion.h1>

          <motion.p
            {...enter(reducedMotion, { y: 14, duration: 0.7, delay: 0.2 })}
            className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ink/70"
          >
            A dozen pieces a season, cut for men, women, and the smallest members of the house.
            Every silhouette earns its place before it earns a home.
          </motion.p>

          <motion.div {...enter(reducedMotion, { y: 14, duration: 0.7, delay: 0.3 })} className="mt-9">
            <button
              onClick={() => setSelectedPiece(piece)}
              className="group inline-flex items-center gap-2 rounded-full bg-surface px-7 py-4 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-accent-deep shadow-[0_16px_30px_-14px_rgba(46,42,82,0.5)] transition-transform hover:scale-[1.03]"
            >
              Shop This Look
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </motion.div>

          <motion.div
            {...enter(reducedMotion, { duration: 0.6, delay: 0.5 })}
            className="mt-12 flex items-center gap-3"
          >
            {[AtSign, Globe, Send].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Follow Atelier"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-surface/50 text-surface transition-colors hover:bg-surface hover:text-accent-deep"
              >
                <Icon size={15} strokeWidth={1.6} />
              </a>
            ))}
          </motion.div>
        </div>

        <div className="relative flex flex-col items-center justify-center md:col-span-6">
          {/* soft chevron shape behind the floating product, matching the
              reference's coral arrow accent */}
          <div
            className="pointer-events-none absolute right-[6%] top-1/2 hidden h-[70%] w-[46%] -translate-y-1/2 md:block"
            style={{
              background: "var(--color-blush)",
              opacity: 0.55,
              clipPath: "polygon(30% 0%, 100% 50%, 30% 100%, 55% 50%)",
            }}
          />

          <motion.button
            key={piece.id}
            onClick={() => setSelectedPiece(piece)}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`View ${piece.name}`}
            className="relative aspect-[3/4] w-[62%] max-w-[280px] overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_30px_60px_-20px_rgba(46,42,82,0.45)] sm:w-[52%]"
          >
            <img
              src={unsplash(piece.image, 700)}
              alt={piece.name}
              className="h-full w-full object-cover"
            />
          </motion.button>

          {/* dot pagination */}
          <div className="relative z-10 mt-6 flex items-center gap-2">
            {FEATURED.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                aria-label={`Show ${p.name}`}
                aria-current={active === i}
                className={`h-2.5 rounded-full transition-all ${
                  active === i ? "w-6 bg-accent" : "w-2.5 bg-surface/70 hover:bg-surface"
                }`}
              />
            ))}
          </div>

          {/* price card + thumbnail strip */}
          <div className="relative z-10 mt-6 flex items-end gap-3">
            <button
              onClick={() => setSelectedPiece(piece)}
              className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left shadow-[0_14px_30px_-16px_rgba(46,42,82,0.4)]"
            >
              <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                <img
                  src={unsplash(piece.image, 100)}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-sans text-[12px] font-semibold text-ink">{piece.name}</p>
                <p className="font-sans text-[12px] text-accent-deep">
                  ${piece.price.toLocaleString()}
                </p>
              </div>
            </button>

            {FEATURED.map((p, i) =>
              i === active ? null : (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${p.name}`}
                  className="hidden h-16 w-12 overflow-hidden rounded-xl opacity-80 shadow-[0_10px_20px_-12px_rgba(46,42,82,0.4)] transition-opacity hover:opacity-100 sm:block"
                >
                  <img
                    src={unsplash(p.image, 100)}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
