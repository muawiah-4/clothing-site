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
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
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

  const scale = cursorVariant === "hover" ? 1.5 : cursorVariant === "view" ? 2.4 : 1;
  const hidden = cursorVariant === "hidden";

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block" aria-hidden="true">
      {/* small solid lead dot, tracks the raw pointer 1:1 */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-2 w-2 rounded-full bg-accent-deep shadow-[0_0_0_3px_rgba(73,193,214,0.18)] transition-opacity duration-200"
        style={{ opacity: hidden ? 0 : 1 }}
      />
      {/* ringPosRef carries only position (rAF-driven, every frame); the
          scale/opacity live one level down so React's transitions on them
          are never clobbered by the position loop overwriting `transform` */}
      <div ref={ringPosRef} className="fixed left-0 top-0">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 ease-out"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            opacity: hidden ? 0 : 1,
            background:
              "linear-gradient(135deg, rgba(185,197,242,0.35), rgba(203,183,230,0.35), rgba(242,198,216,0.35))",
            backdropFilter: "blur(6px)",
            boxShadow:
              "0 8px 24px -8px rgba(46,42,82,0.35), inset 0 0 0 1px rgba(255,255,255,0.6)",
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
