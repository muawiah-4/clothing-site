import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COLLECTION, unsplash } from "../data/collection";
import { scrollToSection } from "../lib/scroll";
import { useExperienceStore } from "../store/experience";

type Phase = "closed" | "playing" | "bursting" | "leaving";

const BURST_ITEMS = COLLECTION.slice(0, 7);

// deterministic radial scatter, clamped to the actual viewport at the moment
// the wardrobe opens so garments never scatter past the screen edge on
// narrower or shorter viewports (previously a fixed pixel radius clipped
// off-screen at common desktop sizes)
function computeScatter(vw: number, vh: number) {
  const maxRadius = Math.max(90, Math.min(vw, vh) * 0.3);
  return BURST_ITEMS.map((_, i) => {
    const angle = (i / BURST_ITEMS.length) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.15);
    const radius = maxRadius * (0.55 + (i % 3) * 0.18);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.55 - vh * 0.02,
      rotate: (i % 2 === 0 ? 1 : -1) * (8 + i * 3),
    };
  });
}

export default function WardrobeReveal() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [scatter, setScatter] = useState(() => computeScatter(1440, 900));
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timers = useRef<number[]>([]);
  const setWardrobeOpened = useExperienceStore((s) => s.setWardrobeOpened);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  useEffect(() => {
    const timerList = timers.current;
    return () => {
      timerList.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const scheduleSequence = useCallback((toBurstDelay: number) => {
    timers.current.push(window.setTimeout(() => setPhase("bursting"), toBurstDelay));
    timers.current.push(window.setTimeout(() => setPhase("leaving"), toBurstDelay + 1100));
    timers.current.push(
      window.setTimeout(() => scrollToSection("collection"), toBurstDelay + 1300),
    );
  }, []);

  const open = useCallback(() => {
    if (phase !== "closed") return;
    setPhase("playing");
    setWardrobeOpened(true);
    setScatter(computeScatter(window.innerWidth, window.innerHeight));

    const video = videoRef.current;
    if (!video || reducedMotion) {
      // reduced-motion / no-video fallback: skip straight to the burst + transition
      setPhase("bursting");
      scheduleSequence(0);
      return;
    }

    video.currentTime = 0;
    video
      .play()
      .then(() => {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6;
        // garments emerge roughly when the doors are fully open in the source clip
        scheduleSequence(duration * 550);
      })
      .catch(() => {
        // autoplay blocked — skip the door-opening shot but still complete
        // the full sequence so the click never dead-ends
        setPhase("bursting");
        scheduleSequence(300);
      });
  }, [phase, reducedMotion, scheduleSequence, setWardrobeOpened]);

  // plays automatically the moment the section comes properly into view, and
  // resets on the way out so scrolling back to it plays the whole sequence
  // again rather than leaving it permanently open after the first visit
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (phaseRef.current === "closed") openRef.current();
          return;
        }
        if (phaseRef.current === "closed") return;
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
        setPhase("closed");
        setWardrobeOpened(false);
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setWardrobeOpened]);

  return (
    <section
      id="wardrobe"
      ref={sectionRef}
      className="card-shell relative mx-3 mt-3 h-[86vh] overflow-hidden bg-spotlight md:mx-6 md:mt-4"
    >
      {/* the wardrobe itself is now the full-bleed background, not a small floating card */}
      <button
        onClick={open}
        disabled={phase !== "closed"}
        aria-label="Open the archive wardrobe"
        className="group absolute inset-0 h-full w-full"
      >
        <img
          src="/media/wardrobe-poster.png"
          alt="A closed walnut wardrobe with brass hardware"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: phase === "closed" ? 1 : 0 }}
        />
        <video
          ref={videoRef}
          src="/media/wardrobe-reveal.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: phase === "closed" ? 0 : 1, transition: "opacity 0.4s ease" }}
        />

        {phase === "closed" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-spotlight via-spotlight/30 to-spotlight/55" />
            <span className="absolute inset-0 flex items-center justify-center bg-spotlight/0 opacity-0 transition-opacity duration-300 group-hover:bg-spotlight/20 group-hover:opacity-100">
              <span className="flex h-24 w-24 items-center justify-center rounded-full border border-white/50 bg-surface/15 font-sans text-[11px] uppercase tracking-[0.2em] text-surface backdrop-blur-md">
                Open
              </span>
            </span>
          </>
        )}
      </button>

      {/* fades out as soon as the sequence starts so the burst never has to
          fight the headline for legibility */}
      <div
        className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center transition-opacity duration-500"
        style={{ opacity: phase === "closed" ? 1 : 0 }}
      >
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.3em] text-accent">
          The Archive
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold text-surface sm:text-5xl md:text-6xl">
          What the house keeps.
        </h2>
        <p className="mt-5 max-w-md font-sans text-[15px] leading-relaxed text-surface/70">
          Twelve pieces live behind these doors. Open the wardrobe to bring the archive forward.
        </p>
      </div>

      <AnimatePresence>
        {(phase === "bursting" || phase === "leaving") && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {BURST_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.25, x: 0, y: 40 }}
                animate={{
                  opacity: phase === "leaving" ? 0 : 1,
                  scale: phase === "leaving" ? 0.6 : 1,
                  x: scatter[i].x,
                  y: scatter[i].y,
                  rotate: scatter[i].rotate,
                }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 16,
                  delay: i * 0.05,
                }}
                className="absolute h-28 w-20 overflow-hidden rounded-xl shadow-2xl sm:h-36 sm:w-26"
              >
                <img
                  src={unsplash(item.image, 300)}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
