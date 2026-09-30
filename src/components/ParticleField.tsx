import { useEffect, useRef, useState } from "react";
import { useExperienceStore } from "../store/experience";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: "surface" | "accent";
}

/**
 * A quiet field of drifting dots behind the Hero copy, gently pushed aside
 * by the cursor — the one moment on the page that isn't just a card/photo,
 * giving the gradient some texture and interactivity of its own.
 */
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  // touch devices can't push the particles around, so the effect is pure
  // battery cost there — skip it entirely
  const [coarsePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  const disabled = reducedMotion || coarsePointer;

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let raf = 0;
    let inView = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / 22000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() > 0.82 ? "accent" : "surface",
      }));
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    const tick = () => {
      raf = 0;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < 90) {
          const force = (90 - dist) / 90;
          p.x += (dx / (dist || 1)) * force * 1.6;
          p.y += (dy / (dist || 1)) * force * 1.6;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === "accent" ? "rgba(73,193,214,0.55)" : "rgba(255,255,255,0.45)";
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    // only animate while the Hero is on screen and the tab is visible
    const sync = () => {
      const shouldRun = inView && !document.hidden;
      if (shouldRun && !raf) raf = requestAnimationFrame(tick);
      if (!shouldRun && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });

    seed();
    sync();
    observer.observe(parent);
    document.addEventListener("visibilitychange", sync);
    parent.addEventListener("pointermove", onPointerMove);
    parent.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", seed);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", seed);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
