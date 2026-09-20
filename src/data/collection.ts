const U = "https://images.unsplash.com/photo-";

export type Gender = "men" | "women" | "kids";

export interface CollectionPiece {
  id: string;
  name: string;
  category: string;
  gender: Gender;
  index: string;
  price: number;
  image: string;
}

export const COLLECTION: CollectionPiece[] = [
  // ---- men ----
  { id: "nocturne", name: "Nocturne Coat", category: "Outerwear", gender: "men", index: "01", price: 1980, image: `${U}1603189343302-e603f7add05a` },
  { id: "silhouette-iv", name: "Silhouette No. IV", category: "Tailoring", gender: "men", index: "02", price: 1240, image: `${U}1592833578500-1082e18665a3` },
  { id: "sculpted-form", name: "Sculpted Form", category: "Studio", gender: "men", index: "03", price: 1590, image: `${U}1779810677455-449ae4ee2bc7` },

  // ---- women ----
  { id: "grey-hour", name: "Grey Hour Blazer", category: "Tailoring", gender: "women", index: "04", price: 1080, image: `${U}1613915617430-8ab0fd7c6baf` },
  { id: "liquid-silk", name: "Liquid Silk Gown", category: "Eveningwear", gender: "women", index: "05", price: 2450, image: `${U}1664076458686-3449062080ac` },
  { id: "ivory-tailleur", name: "Ivory Tailleur", category: "Tailoring", gender: "women", index: "06", price: 1320, image: `${U}1659522761084-79196b64abe4` },
  { id: "midnight-sequin", name: "Midnight Sequin", category: "Eveningwear", gender: "women", index: "07", price: 2680, image: `${U}1551113006-731674fbb3ff` },
  { id: "alpine", name: "Alpine Shearling", category: "Outerwear", gender: "women", index: "08", price: 2190, image: `${U}1762843352680-21a700cb56ac` },
  { id: "cobalt-drape", name: "Cobalt Drape", category: "Eveningwear", gender: "women", index: "09", price: 1860, image: `${U}1765490106170-4322b6cc96fe` },

  // ---- kids ----
  { id: "kids-marigold", name: "Marigold Shell", category: "Outerwear", gender: "kids", index: "10", price: 165, image: `${U}1781735974892-360b1cbf8765` },
  { id: "kids-berry-hood", name: "Berry Hood", category: "Knitwear", gender: "kids", index: "11", price: 128, image: `${U}1586038693164-cb7ee3fb8e2c` },
  { id: "kids-ecru-shirt", name: "Ecru Poplin Shirt", category: "Shirting", gender: "kids", index: "12", price: 95, image: `${U}1611949341310-61649ecb5144` },
];

export const PORTRAIT_IMAGE = `${U}1567425601834-0768cf9f3c78`;

export const CRAFT_IMAGES = [
  `${U}1680835099030-9c7532f744f1`,
  `${U}1721578006568-17901600cff3`,
  `${U}1661609859761-8b21d320049f`,
];

export function unsplash(id: string, width: number): string {
  return `${id}?w=${width}&q=80&auto=format&fit=crop`;
}
