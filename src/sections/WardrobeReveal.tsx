import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { m, AnimatePresence } from "motion/react";
import { COLLECTION, unsplash } from "../data/collection";
import { scrollToSection } from "../lib/scroll";
import { useExperienceStore } from "../store/experience";

type Phase = "closed" | "playing" | "bursting" | "leaving";

// intrinsic size of public/media/wardrobe-poster.webp (reserves its box)
const POSTER_WIDTH = 1600;
const POSTER_HEIGHT = 900;

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
  // bumped on every open/reset/skip so a video.play() promise that settles
  // after the sequence was reset (pause() rejects it) can't schedule timers
  const generation = useRef(0);
  const setCursorLabel = useExperienceStore((s) => s.setCursorLabel);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  // the clip's <source> is only attached once the section is within half a
  // screen of the viewport, so visitors who never get this far never download
  // it. Reduced motion never plays it (the burst runs without the clip).
  const [videoAttached, setVideoAttached] = useState(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  // read timers.current at cleanup time — the array is replaced on every
  // reset, so a copy captured at mount would miss later timers
  useEffect(() => clearTimers, [clearTimers]);

  // never moves the user's scroll position — the collection is reached via
  // the click-only CTA shown once the burst has played
  const scheduleSequence = useCallback((toBurstDelay: number) => {
    timers.current.push(window.setTimeout(() => setPhase("bursting"), toBurstDelay));
    timers.current.push(window.setTimeout(() => setPhase("leaving"), toBurstDelay + 1100));
  }, []);

  const open = useCallback(() => {
    if (phase !== "closed") return;
    const gen = ++generation.current;
    setPhase("playing");
    setScatter(computeScatter(window.innerWidth, window.innerHeight));

    const video = videoRef.current;
    if (!video || reducedMotion) {
      // reduced-motion / no-video fallback: skip straight to the burst + transition
      setPhase("bursting");
      scheduleSequence(0);
      return;
    }

    // opened before the proximity observer attached the sources (a jump
    // straight here, or a click): attach synchronously so play() has a source
    if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      flushSync(() => setVideoAttached(true));
    }
    video.currentTime = 0;
    video
      .play()
      .then(() => {
        if (gen !== generation.current) return;
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6;
        // garments emerge roughly when the doors are fully open in the source clip
        scheduleSequence(duration * 550);
      })
      .catch(() => {
        if (gen !== generation.current) return;
        // autoplay blocked — skip the door-opening shot but still complete
        // the full sequence so the click never dead-ends
        setPhase("bursting");
        scheduleSequence(300);
      });
  }, [phase, reducedMotion, scheduleSequence]);

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
    if (!el || reducedMotion || videoAttached) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVideoAttached(true);
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, videoAttached]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // reduced-motion users get the wardrobe closed and waiting for an
          // explicit click rather than an unrequested autoplay + auto-scroll
          if (phaseRef.current === "closed" && !reducedMotion) openRef.current();
          return;
        }
        if (phaseRef.current === "closed") return;
        generation.current += 1;
        clearTimers();
        setPhase("closed");
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
  }, [reducedMotion, clearTimers]);

  const skip = useCallback(() => {
    generation.current += 1;
    clearTimers();
    const video = videoRef.current;
    if (video) video.pause();
    setPhase("leaving");
  }, [clearTimers]);

  return (
    <section
      id="wardrobe"
      ref={sectionRef}
      className="relative mt-16 h-[86vh] overflow-hidden bg-spotlight md:mt-24"
    >
      {/* the wardrobe itself is now the full-bleed background, not a small floating card */}
      <button
        onClick={open}
        onMouseEnter={() => phase === "closed" && setCursorLabel("Open")}
        onMouseLeave={() => setCursorLabel(null)}
        disabled={phase !== "closed"}
        aria-label="Open the archive wardrobe"
        className="group absolute inset-0 h-full w-full"
      >
        <img
          src="/media/wardrobe-poster.webp"
          alt="A closed walnut wardrobe with brass hardware"
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: phase === "closed" ? 1 : 0 }}
        />
        {/* preload stays "none" until the sources are attached near the
            viewport; then "auto" buffers it ahead of the autoplay */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload={videoAttached ? "auto" : "none"}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: phase === "closed" ? 0 : 1, transition: "opacity 0.4s ease" }}
        >
          {/* 1280x720 H.264, no audio, moov first (fast start), ~0.7MB */}
          {videoAttached && <source src="/media/wardrobe-reveal-720.mp4" type="video/mp4" />}
        </video>

        {phase === "closed" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-spotlight via-spotlight/30 to-spotlight/55" />
            <span className="absolute inset-0 flex items-center justify-center bg-spotlight/0 opacity-0 transition-opacity duration-300 group-hover:bg-spotlight/20 group-hover:opacity-100">
              <span className="flex h-24 w-24 items-center justify-center rounded-full border border-white/50 bg-surface/15 font-sans text-label-xs uppercase text-surface backdrop-blur-md">
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
        <p className="font-sans text-label-xs font-semibold uppercase text-accent-soft">
          The Archive
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold text-surface sm:text-5xl md:text-6xl">
          What the house keeps.
        </h2>
        <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-surface/70">
          Twelve pieces live behind these doors. Open the wardrobe to bring the archive forward.
        </p>
      </div>

      {(phase === "playing" || phase === "bursting") && (
        <button
          onClick={skip}
          className="absolute right-5 top-5 z-30 rounded-full border border-white/40 bg-spotlight/60 px-4 py-2 font-sans text-label-xs uppercase text-surface backdrop-blur-md transition-colors hover:bg-spotlight/85"
        >
          Skip
        </button>
      )}

      {phase === "leaving" && (
        <button
          onClick={() => scrollToSection("collection")}
          className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/40 bg-spotlight/60 px-6 py-3 font-sans text-label-xs uppercase text-surface backdrop-blur-md transition-colors hover:bg-spotlight/85"
        >
          Shop the collection
        </button>
      )}

      <AnimatePresence>
        {(phase === "bursting" || phase === "leaving") && (
          <m.div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            aria-hidden="true"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {BURST_ITEMS.map((item, i) => (
              <m.div
                key={item.id}
                initial={
                  reducedMotion
                    ? { opacity: 0, x: scatter[i].x, y: scatter[i].y, rotate: scatter[i].rotate }
                    : { opacity: 0, scale: 0.25, x: 0, y: 40 }
                }
                animate={{
                  opacity: phase === "leaving" ? 0 : 1,
                  scale: phase === "leaving" ? 0.6 : 1,
                  x: scatter[i].x,
                  y: scatter[i].y,
                  rotate: scatter[i].rotate,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 140, damping: 16, delay: i * 0.05 }
                }
                className="absolute h-28 w-20 overflow-hidden rounded-xl shadow-2xl sm:h-36 sm:w-26"
              >
                <img
                  src={unsplash(item.image, 300)}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </m.div>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
