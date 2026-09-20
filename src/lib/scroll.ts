import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

export function scrollToSection(id: string, duration = 1.6) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = lenisInstance;
  if (lenis) {
    lenis.scrollTo(el, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
