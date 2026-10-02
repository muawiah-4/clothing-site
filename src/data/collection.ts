const U = "https://images.unsplash.com/photo-";

export type Gender = "men" | "women";

export const SIZES = ["XS", "S", "M", "L", "XL"];

export interface CollectionPiece {
  id: string;
  name: string;
  category: string;
  gender: Gender;
  index: string;
  price: number;
  image: string;
  /** CSS object-position for the 3:4 card crop, tuned so the garment, not the face, holds the frame */
  objectPosition: string;
  /**
   * Extra views for the buy panel: tighter crops of the same photograph
   * (Unsplash/imgix focal-point crops), so every view is the same garment.
   */
  gallery: GalleryShot[];
  fabric: string;
  fit: string;
  care: string;
}

export interface GalleryShot {
  image: string;
  label: string;
  /** focal point, 0–1 across and down the source photo */
  fx: number;
  fy: number;
  /** imgix fp-z: 1 is the full frame, higher crops in */
  zoom: number;
}

/** Two closer views of a piece's photo, centred on where its card crop sits. */
function detailShots(image: string, objectPosition: string, fx = 0.5): GalleryShot[] {
  const y = Number.parseFloat(objectPosition.split(" ")[1] ?? "50") / 100;
  const round = (n: number) => Math.round(n * 100) / 100;
  return [
    { image, label: "Upper detail", fx, fy: round(Math.max(0.3, y - 0.12)), zoom: 1.6 },
    { image, label: "Close-up", fx: round(fx - 0.05), fy: round(Math.max(0.3, y - 0.05)), zoom: 2.4 },
  ];
}

export const COLLECTION: CollectionPiece[] = [
  // ---- men (parity with women: 2 Outerwear, 2 Tailoring, 2 Eveningwear) ----
  {
    id: "nocturne",
    name: "Nocturne Coat",
    category: "Outerwear",
    gender: "men",
    index: "01",
    price: 1980,
    image: `${U}1553143820-6bb68bc34679`,
    objectPosition: "50% 55%",
    gallery: detailShots(`${U}1553143820-6bb68bc34679`, "50% 55%"),
    fabric: "Brushed wool-cashmere blend",
    fit: "Relaxed through the shoulder, tapered at the hem",
    care: "Dry clean only",
  },
  {
    id: "colonnade",
    name: "Colonnade Coat",
    category: "Outerwear",
    gender: "men",
    index: "02",
    price: 2150,
    image: `${U}1585820122150-3a0909e77e20`,
    objectPosition: "50% 50%",
    gallery: detailShots(`${U}1585820122150-3a0909e77e20`, "50% 50%"),
    fabric: "Double-faced Italian wool",
    fit: "Structured shoulder, knee-length",
    care: "Dry clean only",
  },
  {
    id: "silhouette-iv",
    name: "Silhouette No. IV",
    category: "Tailoring",
    gender: "men",
    index: "03",
    price: 1240,
    image: `${U}1507679799987-c73779587ccf`,
    objectPosition: "50% 40%",
    gallery: detailShots(`${U}1507679799987-c73779587ccf`, "50% 40%"),
    fabric: "Super 120s wool",
    fit: "Slim through the waist, full-canvas construction",
    care: "Dry clean, press with a cloth",
  },
  {
    id: "flannel-two-piece",
    name: "Grey Flannel Two-Piece",
    category: "Tailoring",
    gender: "men",
    index: "04",
    price: 1380,
    image: `${U}1546572797-e8c933a75a1f`,
    objectPosition: "50% 60%",
    gallery: detailShots(`${U}1546572797-e8c933a75a1f`, "50% 60%"),
    fabric: "Brushed flannel wool",
    fit: "Classic straight, single-button",
    care: "Dry clean, press with a cloth",
  },
  {
    id: "dinner-jacket",
    name: "Dinner Jacket, No. I",
    category: "Eveningwear",
    gender: "men",
    index: "05",
    price: 2450,
    image: `${U}1755537131223-7c1b667696fd`,
    objectPosition: "50% 45%",
    gallery: detailShots(`${U}1755537131223-7c1b667696fd`, "50% 45%"),
    fabric: "Silk-faced wool jacquard",
    fit: "Shawl collar, fitted through the torso",
    care: "Dry clean only",
  },
  {
    id: "onyx-tuxedo",
    name: "Onyx Tuxedo",
    category: "Eveningwear",
    gender: "men",
    index: "06",
    price: 2680,
    image: `${U}1522968439036-e6338d0ed84f`,
    objectPosition: "50% 50%",
    gallery: detailShots(`${U}1522968439036-e6338d0ed84f`, "50% 50%"),
    fabric: "Barathea wool, satin lapel",
    fit: "Peak lapel, fitted",
    care: "Dry clean only",
  },

  // ---- women ----
  {
    id: "grey-hour",
    name: "Grey Hour Blazer",
    category: "Tailoring",
    gender: "women",
    index: "07",
    price: 1080,
    image: `${U}1613915617430-8ab0fd7c6baf`,
    objectPosition: "50% 45%",
    gallery: detailShots(`${U}1613915617430-8ab0fd7c6baf`, "50% 45%"),
    fabric: "Wool-mohair blend",
    fit: "Sharp shoulder, cropped at the hip",
    care: "Dry clean only",
  },
  {
    id: "liquid-silk",
    name: "Liquid Silk Gown",
    category: "Eveningwear",
    gender: "women",
    index: "08",
    price: 2450,
    image: `${U}1664076458686-3449062080ac`,
    objectPosition: "50% 55%",
    gallery: detailShots(`${U}1664076458686-3449062080ac`, "50% 60%", 0.72),
    fabric: "100% silk charmeuse",
    fit: "Bias-cut, floor length",
    care: "Dry clean only",
  },
  {
    id: "ivory-tailleur",
    name: "Ivory Tailleur",
    category: "Tailoring",
    gender: "women",
    index: "09",
    price: 1320,
    image: `${U}1659522761084-79196b64abe4`,
    objectPosition: "50% 50%",
    gallery: detailShots(`${U}1659522761084-79196b64abe4`, "50% 50%", 0.68),
    fabric: "Wool crepe",
    fit: "Structured, nipped waist",
    care: "Dry clean only",
  },
  {
    id: "midnight-sequin",
    name: "Midnight Sequin",
    category: "Eveningwear",
    gender: "women",
    index: "10",
    price: 2680,
    image: `${U}1551113006-731674fbb3ff`,
    objectPosition: "50% 70%",
    gallery: detailShots(`${U}1551113006-731674fbb3ff`, "50% 70%"),
    fabric: "Hand-embroidered sequin mesh",
    fit: "Fitted through the hip, fluted hem",
    care: "Dry clean only",
  },
  {
    id: "alpine",
    name: "Alpine Shearling",
    category: "Outerwear",
    gender: "women",
    index: "11",
    price: 2190,
    image: `${U}1762843352680-21a700cb56ac`,
    objectPosition: "50% 50%",
    gallery: detailShots(`${U}1762843352680-21a700cb56ac`, "50% 50%"),
    fabric: "Shearling, leather trim",
    fit: "Oversized, dropped shoulder",
    care: "Specialist leather clean only",
  },
  {
    id: "aubergine-drape",
    name: "Aubergine Drape",
    category: "Eveningwear",
    gender: "women",
    index: "12",
    price: 1860,
    image: `${U}1566174053879-31528523f8ae`,
    objectPosition: "50% 65%",
    gallery: detailShots(`${U}1566174053879-31528523f8ae`, "50% 65%"),
    fabric: "Silk crêpe-back satin",
    fit: "Off the shoulder, draped through the bodice",
    care: "Dry clean only",
  },
];

export const PORTRAIT_IMAGE = `${U}1567425601834-0768cf9f3c78`;

export const CRAFT_IMAGES = [
  `${U}1680835099030-9c7532f744f1`,
  `${U}1528459105426-b9548367069b`,
  `${U}1584184924103-e310d9dc82fc`,
];

export function unsplash(id: string, width: number): string {
  return `${id}?w=${width}&q=80&auto=format&fit=crop`;
}

/** `srcset` for an Unsplash photo at each of `widths` (Unsplash resizes via `w=`). */
export function unsplashSrcSet(id: string, widths: number[]): string {
  return widths.map((w) => `${unsplash(id, w)} ${w}w`).join(", ");
}

/** A 3:4 focal-point crop of a gallery shot at `width`. */
export function shotSrc(shot: GalleryShot, width: number): string {
  const h = Math.round((width * 4) / 3);
  return `${shot.image}?w=${width}&h=${h}&q=80&auto=format&fit=crop&crop=focalpoint&fp-x=${shot.fx}&fp-y=${shot.fy}&fp-z=${shot.zoom}`;
}
