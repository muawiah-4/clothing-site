import { useEffect } from "react";
import { useExperienceStore } from "../store/experience";

export function useDevicePerformance() {
  const setReducedMotion = useExperienceStore((s) => s.setReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [setReducedMotion]);
}
