import { useEffect, useRef } from "react";
import { useExperienceStore } from "../store/experience";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringPosRef = useRef<HTMLDivElement>(null);
  const cursorVariant = useExperienceStore((s) => s.cursorVariant);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    document.documentElement.classList.add("has-custom-cursor");

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    let ringX = startX;
    let ringY = startY;
    let targetX = startX;
    let targetY = startY;
    let raf = 0;

    // seed both cursor layers to the same point so neither shows a stray
    // resting mark at the top-left corner before the first pointermove
    const place = (el: HTMLDivElement | null, x: number, y: number) => {
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };
    place(dotRef.current, startX, startY);
    place(ringPosRef.current, startX, startY);

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      place(dotRef.current, targetX, targetY);
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      place(ringPosRef.current, ringX, ringY);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  const scale = cursorVariant === "hover" ? 1.8 : cursorVariant === "view" ? 2.6 : 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block" aria-hidden="true">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent-deep transition-opacity duration-200"
        style={{ opacity: cursorVariant === "hidden" ? 0 : 1 }}
      />
      {/* ringPosRef carries only position (rAF-driven, every frame); the
          scale/opacity live one level down so React's transitions on them
          are never clobbered by the position loop overwriting `transform` */}
      <div ref={ringPosRef} className="fixed left-0 top-0">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border border-accent bg-surface/30 backdrop-blur-[1px] transition-transform duration-300 ease-out"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            opacity: cursorVariant === "hidden" ? 0 : 1,
          }}
        >
          <span
            className="font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-accent-deep transition-opacity duration-200"
            style={{ opacity: cursorVariant === "view" ? 1 : 0 }}
          >
            View
          </span>
        </div>
      </div>
    </div>
  );
}
