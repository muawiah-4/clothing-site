/**
 * Below-the-fold sections and overlays are split into their own chunks so the
 * first paint only has to download the hero. Each loader is memoised so the
 * same promise backs both React.lazy() and the idle-time preload.
 */
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;
  return () => (promise ??= load());
}

export const sectionLoaders = {
  wardrobe: once(() => import("../sections/WardrobeReveal")),
  collection: once(() => import("../sections/Collection")),
  craft: once(() => import("../sections/Craft")),
  lookbook: once(() => import("../sections/Lookbook")),
  voices: once(() => import("../sections/SocialProof")),
  contact: once(() => import("../sections/Contact")),
};

export const overlayLoaders = {
  buyPanel: once(() => import("../components/BuyPanel")),
  bag: once(() => import("../components/Bag")),
  mobileMenu: once(() => import("../components/MobileMenu")),
};

let sectionsPromise: Promise<unknown> | null = null;

/** Starts (or joins) the download of every lazy section chunk. */
export function preloadSections(): Promise<unknown> {
  return (sectionsPromise ??= Promise.all(Object.values(sectionLoaders).map((load) => load())));
}

export function preloadOverlays(): Promise<unknown> {
  return Promise.all(Object.values(overlayLoaders).map((load) => load()));
}

/** Suspense placeholders carry this attribute until their section mounts. */
export const PLACEHOLDER_ATTR = "data-section-placeholder";

/**
 * Resolves once every lazy section chunk has loaded and React has swapped all
 * placeholders for the real sections, so scroll targets have final positions.
 * Gives up after ~2s and resolves anyway (the caller then scrolls to whatever
 * is there).
 */
export function whenSectionsMounted(): Promise<void> {
  return preloadSections().then(
    () =>
      new Promise<void>((resolve) => {
        const deadline = performance.now() + 2000;
        const check = () => {
          const pending = document.querySelector(`[${PLACEHOLDER_ATTR}]`);
          if (!pending || performance.now() > deadline) {
            // one more frame so the freshly committed sections have laid out
            requestAnimationFrame(() => resolve());
            return;
          }
          requestAnimationFrame(check);
        };
        check();
      }),
  );
}

export function sectionsMounted(): boolean {
  return sectionsPromise !== null && !document.querySelector(`[${PLACEHOLDER_ATTR}]`);
}
