import { useEffect } from "react";
import { useExperienceStore } from "./store/experience";
import { useDevicePerformance } from "./hooks/useDevicePerformance";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import Companion from "./components/Companion";
import BuyPanel from "./components/BuyPanel";
import Bag from "./components/Bag";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import BrandStory from "./sections/BrandStory";
import WardrobeReveal from "./sections/WardrobeReveal";
import Collection from "./sections/Collection";
import Craft from "./sections/Craft";
import Lookbook from "./sections/Lookbook";
import SocialProof from "./sections/SocialProof";
import Contact from "./sections/Contact";

export default function App() {
  useDevicePerformance();
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  useSmoothScroll(true, reducedMotion);

  useEffect(() => {
    document.title = "Atelier — Form in Material";
  }, []);

  return (
    <div className="relative">
      <Preloader />
      <Cursor />
      <Navbar />
      <Companion />
      <main>
        <Hero />
        <BrandStory />
        <WardrobeReveal />
        <Collection />
        <Craft />
        <Lookbook />
        <SocialProof />
        <Contact />
      </main>
      <Footer />
      <BuyPanel />
      <Bag />
    </div>
  );
}
