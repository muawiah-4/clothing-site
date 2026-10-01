import { useState } from "react";
import { m } from "motion/react";
import { ArrowRight, AtSign, Send } from "lucide-react";
import { COLLECTION, unsplash, unsplashSrcSet, type CollectionPiece } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { enter } from "../lib/motion";
import { scrollToSection } from "../lib/scroll";
import ShimmerImage from "../components/ShimmerImage";
import ParticleField from "../components/ParticleField";
import { formatPrice } from "../lib/format";

// a spread across both wardrobes and all three categories, so the very
// first thing a visitor sees isn't skewed toward one gender
const FEATURED_IDS = ["nocturne", "ivory-tailleur", "midnight-sequin"];
// ids that no longer exist in the collection are dropped rather than crashing
// the page; if none survive, fall back to the first pieces in the archive
const FEATURED_FOUND = FEATURED_IDS.map((id) => COLLECTION.find((p) => p.id === id)).filter(
  (p): p is CollectionPiece => p !== undefined,
);
const FEATURED = FEATURED_FOUND.length > 0 ? FEATURED_FOUND : COLLECTION.slice(0, 3);

// The first featured photo is the page's LCP element. index.html preloads
// exactly these URLs — keep HERO_WIDTHS / HERO_SIZES / the default src in
// sync with the <link rel="preload"> there if you change them or FEATURED[0].
const HERO_WIDTHS = [360, 540, 720, 1080];
const HERO_SIZES = "(min-width: 640px) 360px, 78vw";

export default function Hero() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const setSelectedPiece = useExperienceStore((s) => s.setSelectedPiece);
  const setCursorLabel = useExperienceStore((s) => s.setCursorLabel);
  const [active, setActive] = useState(0);
  // the very first photo is the LCP element: it must not start at opacity 0
  // (that delays LCP until the fade), so only later swaps fade in
  const [swapped, setSwapped] = useState(false);
  const piece = FEATURED[active];
  const show = (i: number) => {
    setSwapped(true);
    setActive(i);
  };

  if (!piece) return null;

  return (
    <section
      id="top"
      className="relative -mt-24 overflow-hidden pt-24"
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

      <ParticleField />

      {/* the gradient belongs to the hero only: let it settle into the paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-paper"
      />

      <div className="relative grid grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:gap-6 md:px-14 md:py-28">
        <div className="flex flex-col justify-center md:col-span-6">
          <m.p
            {...enter(reducedMotion, { y: 10, duration: 0.7 })}
            className="font-sans text-[12px] font-semibold uppercase tracking-[0.3em] text-accent-deep"
          >
            The Current Edit
          </m.p>

          <m.h1
            {...enter(reducedMotion, { y: 24, duration: 0.8, delay: 0.1 })}
            className="mt-5 font-display leading-[1.05] text-ink"
          >
            <span className="block text-4xl font-normal sm:text-5xl md:text-6xl">
              Considered pieces,
            </span>
            <span className="block text-4xl font-extrabold sm:text-5xl md:text-6xl">
              made to outlast trend.
            </span>
          </m.h1>

          <m.p
            {...enter(reducedMotion, { y: 14, duration: 0.7, delay: 0.2 })}
            className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ink/90"
          >
            A dozen pieces a season, cut for men and women alike. Every silhouette earns its
            place before it earns a home.
          </m.p>

          <m.div {...enter(reducedMotion, { y: 14, duration: 0.7, delay: 0.3 })} className="mt-9">
            <button
              onClick={() => setSelectedPiece(piece)}
              className="group inline-flex items-center gap-2 rounded-full border border-white/50 bg-surface/50 px-7 py-4 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-accent-deep shadow-[0_16px_30px_-14px_rgba(46,42,82,0.5)] backdrop-blur-xl transition-transform hover:scale-[1.03] hover:bg-surface/70"
            >
              Shop This Look
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </m.div>

          <m.div
            {...enter(reducedMotion, { duration: 0.6, delay: 0.5 })}
            className="mt-12 flex items-center gap-3"
          >
            <a
              href="mailto:studio@atelier.house"
              aria-label="Email the studio"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-surface/60 text-ink backdrop-blur-md transition-colors hover:bg-surface/85 hover:text-accent-deep"
            >
              <AtSign size={15} strokeWidth={1.6} />
            </a>
            <button
              onClick={() => scrollToSection("contact")}
              aria-label="Go to the contact section"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-surface/60 text-ink backdrop-blur-md transition-colors hover:bg-surface/85 hover:text-accent-deep"
            >
              <Send size={15} strokeWidth={1.6} />
            </button>
          </m.div>
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

          <m.button
            key={piece.id}
            onClick={() => setSelectedPiece(piece)}
            onMouseEnter={() => setCursorLabel("Shop")}
            onMouseLeave={() => setCursorLabel(null)}
            initial={
              swapped
                ? reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 20, scale: 0.96 }
                : reducedMotion
                  ? false
                  : { y: 20, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`View ${piece.name}`}
            className="relative aspect-[3/4] w-[78%] max-w-[360px] overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_30px_60px_-20px_rgba(46,42,82,0.45)] sm:w-[68%]"
          >
            <ShimmerImage
              src={unsplash(piece.image, 720)}
              srcSet={unsplashSrcSet(piece.image, HERO_WIDTHS)}
              sizes={HERO_SIZES}
              width={720}
              height={960}
              alt={piece.name}
              loading="eager"
              fetchPriority={swapped ? "auto" : "high"}
              fadeIn={swapped}
              style={{ objectPosition: piece.objectPosition }}
              className="h-full w-full object-cover"
            />
          </m.button>

          {/* dot pagination */}
          <div className="relative z-10 mt-6 flex items-center gap-2">
            {FEATURED.map((p, i) => (
              <button
                key={p.id}
                onClick={() => show(i)}
                aria-label={`Show ${p.name}`}
                aria-current={active === i}
                className={`h-2.5 rounded-full transition-all ${
                  active === i ? "w-6 bg-accent-deep" : "w-2.5 bg-ink/70 hover:bg-ink"
                }`}
              />
            ))}
          </div>

          {/* price card + thumbnail strip */}
          <div className="relative z-10 mt-6 flex items-end gap-3">
            <button
              onClick={() => setSelectedPiece(piece)}
              className="flex items-center gap-3 rounded-2xl border border-white/50 bg-surface/55 px-4 py-3 text-left shadow-[0_14px_30px_-16px_rgba(46,42,82,0.4)] backdrop-blur-xl"
            >
              <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                <ShimmerImage
                  src={unsplash(piece.image, 100)}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-sans text-[12px] font-semibold text-ink">{piece.name}</p>
                <p className="font-sans text-[12px] text-accent-deep">
                  {formatPrice(piece.price)}
                </p>
              </div>
            </button>

            {FEATURED.map((p, i) =>
              i === active ? null : (
                <button
                  key={p.id}
                  onClick={() => show(i)}
                  aria-label={`Show ${p.name}`}
                  className="hidden h-20 w-14 overflow-hidden rounded-xl opacity-80 shadow-[0_10px_20px_-12px_rgba(46,42,82,0.4)] transition-opacity hover:opacity-100 sm:block"
                >
                  <ShimmerImage
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
