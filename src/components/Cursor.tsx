import { useEffect, useRef } from "react";
import { useExperienceStore } from "../store/experience";

/**
 * A small solid dot that morphs into a text-label chip ("View", "Open",
 * "Shop") when hovering something interactive — replaces the earlier
 * glass-ring cursor entirely rather than just recoloring it.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const chipPosRef = useRef<HTMLDivElement>(null);
  const cursorLabel = useExperienceStore((s) => s.cursorLabel);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    document.documentElement.classList.add("has-custom-cursor");

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    let chipX = startX;
    let chipY = startY;
    let targetX = startX;
    let targetY = startY;
    let raf = 0;

    const place = (el: HTMLDivElement | null, x: number, y: number) => {
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };
    place(dotRef.current, startX, startY);
    place(chipPosRef.current, startX, startY);

    const tick = () => {
      // the chip trails slightly — precise enough to feel attached to the
      // pointer, soft enough that the label doesn't jitter while reading
      chipX += (targetX - chipX) * 0.28;
      chipY += (targetY - chipY) * 0.28;
      // once the chip has caught up, snap and stop — pointermove restarts it
      if (Math.abs(targetX - chipX) < 0.1 && Math.abs(targetY - chipY) < 0.1) {
        chipX = targetX;
        chipY = targetY;
        place(chipPosRef.current, chipX, chipY);
        raf = 0;
        return;
      }
      place(chipPosRef.current, chipX, chipY);
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      place(dotRef.current, targetX, targetY);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  const active = cursorLabel !== null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] hidden md:block" aria-hidden="true">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-2 w-2 rounded-full bg-accent-deep transition-opacity duration-200"
        style={{ opacity: active ? 0 : 1 }}
      />
      <div ref={chipPosRef} className="fixed left-0 top-0">
        <div
          className="whitespace-nowrap rounded-full bg-ink px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-surface transition-all duration-200 ease-out"
          style={{
            transform: `translate(-50%, -50%) scale(${active ? 1 : 0.6})`,
            opacity: active ? 1 : 0,
          }}
        >
          {cursorLabel}
        </div>
      </div>
    </div>
  );
}
