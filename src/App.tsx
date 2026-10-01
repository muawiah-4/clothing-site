import { lazy, startTransition, Suspense, useEffect, useState } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import { useExperienceStore } from "./store/experience";
import { useDevicePerformance } from "./hooks/useDevicePerformance";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import {
  overlayLoaders,
  PLACEHOLDER_ATTR,
  preloadOverlays,
  preloadSections,
  sectionLoaders,
} from "./lib/lazySections";
import { scrollToSection } from "./lib/scroll";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import Companion from "./components/Companion";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import BrandStory from "./sections/BrandStory";

const WardrobeReveal = lazy(sectionLoaders.wardrobe);
const Collection = lazy(sectionLoaders.collection);
const Craft = lazy(sectionLoaders.craft);
const Lookbook = lazy(sectionLoaders.lookbook);
const SocialProof = lazy(sectionLoaders.voices);
const Contact = lazy(sectionLoaders.contact);
const BuyPanel = lazy(overlayLoaders.buyPanel);
const Bag = lazy(overlayLoaders.bag);

/** the glass card shell (House, Craft, Contact); other sections sit on the paper */
const CARD = "glass-card";

/**
 * Stand-in for a lazy section until it mounts: same shell and
 * roughly the same height (measured at phone / tablet / desktop widths), so
 * nothing below jumps and there is no blank gap if the visitor scrolls fast.
 */
function Placeholder({ className }: { className: string }) {
  return <div {...{ [PLACEHOLDER_ATTR]: "" }} aria-hidden="true" className={className} />;
}

function SectionPlaceholders() {
  return (
    <>
      <Placeholder className="mt-16 h-[86vh] bg-spotlight md:mt-24" />
      <Placeholder className="min-h-[2600px] lg:min-h-[3600px]" />
      <Placeholder className={`${CARD} min-h-[2100px] md:min-h-[900px]`} />
      <Placeholder className="min-h-[1100px]" />
      <Placeholder className="min-h-[1400px] md:min-h-[990px] lg:min-h-[770px]" />
      <Placeholder className={`${CARD} min-h-[70vh]`} />
    </>
  );
}

function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 1500);
  return () => window.clearTimeout(id);
}

export default function App() {
  useDevicePerformance();
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  useSmoothScroll(true, reducedMotion);

  // overlays mount on first use (then stay mounted so their exit animations run)
  const buyPanelOpen = useExperienceStore((s) => s.selectedPiece !== null);
  const bagOpen = useExperienceStore((s) => s.bagOpen);
  const [buyPanelUsed, setBuyPanelUsed] = useState(false);
  const [bagUsed, setBagUsed] = useState(false);
  if (buyPanelOpen && !buyPanelUsed) setBuyPanelUsed(true);
  if (bagOpen && !bagUsed) setBagUsed(true);

  useEffect(() => {
    document.title = "Atelier — Form in Material";
  }, []);

  // Below-the-fold sections mount after the first frame has painted, in a
  // transition so React renders them in small, interruptible slices instead
  // of one long task competing with the hero's first paint. Their chunks
  // start downloading right away.
  const [mountRest, setMountRest] = useState(false);
  useEffect(() => {
    void preloadSections();
    const raf = requestAnimationFrame(() => {
      startTransition(() => setMountRest(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // warm the overlay chunks once the page is idle so the first open is instant
  useEffect(() => whenIdle(() => void preloadOverlays()), []);

  // a deep link like /#craft: the target is a lazy section, so the browser's
  // own fragment scroll finds nothing — scroll once the sections are in
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) scrollToSection(id);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative">
        <Preloader />
        <Cursor />
        <Navbar />
        <Companion />
        <main>
          <Hero />
          <BrandStory />
          {/* one boundary: the six sections swap in with a single commit (one
              layout pass, one round of scroll/pin re-measuring) */}
          {mountRest ? (
            <Suspense fallback={<SectionPlaceholders />}>
              <WardrobeReveal />
              <Collection />
              <Craft />
              <Lookbook />
              <SocialProof />
              <Contact />
            </Suspense>
          ) : (
            <SectionPlaceholders />
          )}
        </main>
        <Footer />
        {/* separate boundaries: one overlay's first load must not hide the other */}
        <Suspense fallback={null}>{buyPanelUsed && <BuyPanel />}</Suspense>
        <Suspense fallback={null}>{bagUsed && <Bag />}</Suspense>
      </div>
    </LazyMotion>
  );
}
