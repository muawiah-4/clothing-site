import { motion } from "motion/react";
import { unsplash } from "../data/collection";
import { useExperienceStore } from "../store/experience";
import { fade } from "../lib/motion";

interface LookbookPlate {
  src: string;
  alt: string;
  look: string;
  line: string;
  /** desktop grid placement — creates the asymmetric, non-uniform rhythm */
  frame: string;
  /** mobile/tablet aspect ratio, before the grid spans take over at lg */
  ratio: string;
}

const PLATES: LookbookPlate[] = [
  {
    src: "https://images.unsplash.com/photo-1601597565151-70c4020dc0e1",
    alt: "Black and white editorial portrait with sculptural curled hair and zebra-cuffed sleeves over a beaded gown",
    look: "Look 01",
    line: "Studio, Paris",
    frame: "lg:col-span-2 lg:row-span-2",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1627130697816-4d71dbfe6a5b",
    alt: "Model in a cream tailored suit walking past a bare brown wall",
    look: "Look 02",
    line: "Sidewalk fitting, before the doors open",
    frame: "lg:col-span-2 lg:row-span-1",
    ratio: "aspect-[16/10]",
  },
  {
    src: "https://images.unsplash.com/photo-1612731486606-2614b4d74921",
    alt: "Portrait in a black blazer and pearl necklace against a warm terracotta wall",
    look: "Look 03",
    line: "Between takes, half-buttoned",
    frame: "lg:col-span-1 lg:row-span-1",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1668952135120-7d997b1b3778",
    alt: "Moody studio portrait in a long beige trench coat",
    look: "Look 04",
    line: "The trench, held for the long exposure",
    frame: "lg:col-span-1 lg:row-span-2",
    ratio: "aspect-[3/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1613728455120-d00493b5e77e",
    alt: "Still life of a black velvet blazer and dried grasses draped over a wooden chair",
    look: "Look 05",
    line: "What's left on the chair after a fitting",
    frame: "lg:col-span-1 lg:row-span-1",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1759229874810-26aa9a3dda92",
    alt: "Portrait in a black knit dress against wood paneling",
    look: "Look 06",
    line: "Cashmere, cut close to the wall",
    frame: "lg:col-span-1 lg:row-span-1",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58",
    alt: "Portrait in a cobalt tailored suit seated on paper against a teal backdrop",
    look: "Look 07",
    line: "Second pass, better light",
    frame: "lg:col-span-1 lg:row-span-2",
    ratio: "aspect-[3/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1759229874914-c1ffdb3ebd0c",
    alt: "Portrait in a beige knit set against wood paneling",
    look: "Look 08",
    line: "The last look before the lights come down",
    frame: "lg:col-span-2 lg:row-span-1",
    ratio: "aspect-[16/10]",
  },
];

export default function Lookbook() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  return (
    <section
      id="lookbook"
      className="scroll-mt-24 mx-3 mt-3 rounded-[2rem] border border-white/40 bg-surface/55 px-6 py-20 shadow-[0_24px_60px_-30px_rgba(46,42,82,0.35)] backdrop-blur-2xl md:mx-6 md:mt-4 md:px-14 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          {...fade(reducedMotion, { y: 12, duration: 0.7 })}
          className="font-sans text-[12px] font-semibold uppercase tracking-[0.25em] text-accent-deep"
        >
          The Lookbook
        </motion.p>
        <motion.h2
          {...fade(reducedMotion, { y: 16, duration: 0.8, delay: 0.1 })}
          className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl"
        >
          Styled by the studio.
        </motion.h2>
        <motion.p
          {...fade(reducedMotion, { y: 12, duration: 0.7, delay: 0.18 })}
          className="mt-6 max-w-xl font-sans text-[15px] leading-relaxed text-ink-dim"
        >
          Eight frames pulled from the studio's own archive — the fittings, the stills, the quiet
          ten minutes before a shoot goes to print. Not lookbook copy. The actual room.
        </motion.p>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:auto-rows-[13rem] lg:grid-cols-4 lg:grid-flow-dense lg:gap-6">
          {PLATES.map((plate, i) => (
            <motion.figure
              key={plate.look}
              {...fade(reducedMotion, { y: 24, duration: 0.7, delay: Math.min(i * 0.08, 0.4) })}
              className={`group flex flex-col ${plate.frame}`}
            >
              <div
                className={`overflow-hidden rounded-[1.5rem] bg-surface-soft ${plate.ratio} lg:aspect-auto lg:h-full`}
              >
                <img
                  src={unsplash(plate.src, 900)}
                  alt={plate.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="mt-3 font-sans text-[13px] leading-snug text-ink-dim">
                <span className="font-semibold text-ink">{plate.look}</span> — {plate.line}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
