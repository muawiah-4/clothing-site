import { lazy, Suspense, useEffect, useState } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import { useExperienceStore } from "./store/experience";
import { useDevicePerformance } from "./hooks/useDevicePerformance";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { overlayLoaders, PLACEHOLDER_ATTR, preloadOverlays, sectionLoaders } from "./lib/lazySections";
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

/** light card surface without the blur — the real section paints over it */
const CARD = "mx-3 mt-3 rounded-[2rem] border border-white/40 bg-surface/55 md:mx-6 md:mt-4";

/**
 * Stand-in for a lazy section while its chunk downloads: same shell and
 * roughly the same height (measured at phone / tablet / desktop widths), so
 * nothing below jumps and there is no blank gap if the visitor scrolls fast.
 */
function Placeholder({ className }: { className: string }) {
  return <div {...{ [PLACEHOLDER_ATTR]: "" }} aria-hidden="true" className={className} />;
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
          <Suspense
            fallback={<Placeholder className="card-shell mx-3 mt-3 h-[86vh] bg-spotlight md:mx-6 md:mt-4" />}
          >
            <WardrobeReveal />
          </Suspense>
          <Suspense fallback={<Placeholder className={`${CARD} min-h-[2600px] lg:min-h-[3600px]`} />}>
            <Collection />
          </Suspense>
          <Suspense fallback={<Placeholder className={`${CARD} min-h-[2100px] md:min-h-[900px]`} />}>
            <Craft />
          </Suspense>
          <Suspense fallback={<Placeholder className={`${CARD} min-h-[1100px]`} />}>
            <Lookbook />
          </Suspense>
          <Suspense
            fallback={
              <Placeholder className={`${CARD} min-h-[1400px] md:min-h-[990px] lg:min-h-[770px]`} />
            }
          >
            <SocialProof />
          </Suspense>
          <Suspense fallback={<Placeholder className={`${CARD} min-h-[70vh]`} />}>
            <Contact />
          </Suspense>
        </main>
        <Footer />
        {/* separate boundaries: one overlay's first load must not hide the other */}
        <Suspense fallback={null}>{buyPanelUsed && <BuyPanel />}</Suspense>
        <Suspense fallback={null}>{bagUsed && <Bag />}</Suspense>
      </div>
    </LazyMotion>
  );
}
