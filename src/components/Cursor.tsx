import { useEffect, useRef } from "react";
import { useExperienceStore } from "../store/experience";

/**
 * A cursor *accent*, not a cursor replacement: the native pointer stays
 * visible at all times (the old 2px dot hid it and got lost over photos).
 * While an interactive card is hovered (anything that sets `cursorLabel`),
 * a 10px ring sits on the pointer and a label chip ("View", "Shop", "Open")
 * trails just below-right of it, clear of the arrow. Fine pointers only.
 * With reduced motion the chip snaps to the pointer instead of easing.
 */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const chipPosRef = useRef<HTMLDivElement>(null);
  const cursorLabel = useExperienceStore((s) => s.cursorLabel);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let chipX = -100;
    let chipY = -100;
    let targetX = -100;
    let targetY = -100;
    let raf = 0;

    const place = (el: HTMLDivElement | null, x: number, y: number) => {
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const tick = () => {
      chipX += (targetX - chipX) * 0.3;
      chipY += (targetY - chipY) * 0.3;
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
      place(ringRef.current, targetX, targetY);
      if (reducedMotion) {
        place(chipPosRef.current, targetX, targetY);
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const active = cursorLabel !== null;
  const fade = reducedMotion ? "" : "transition-[opacity,scale] duration-200 ease-out";

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] hidden md:block" aria-hidden="true">
      <div ref={ringRef} className="fixed left-0 top-0">
        <div
          className={`-ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full border-2 border-white mix-blend-difference ${fade}`}
          style={{ opacity: active ? 1 : 0 }}
        />
      </div>
      <div ref={chipPosRef} className="fixed left-0 top-0">
        <div
          className={`ml-4 mt-5 origin-top-left whitespace-nowrap rounded-full bg-ink px-3 py-1.5 font-sans text-label-xs font-semibold uppercase text-surface shadow-card ${fade}`}
          style={{ opacity: active ? 1 : 0, scale: active || reducedMotion ? "1" : "0.85" }}
        >
          {cursorLabel}
        </div>
      </div>
    </div>
  );
}
