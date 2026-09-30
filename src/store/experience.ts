import { create } from "zustand";
import type { CollectionPiece, Gender } from "../data/collection";

export type GenderFilter = Gender | "all";

export interface BagItem {
  piece: CollectionPiece;
  size: string;
  qty: number;
}

interface ExperienceState {
  /** text shown in the cursor's hover chip, or null for the plain dot */
  cursorLabel: string | null;
  setCursorLabel: (v: string | null) => void;

  wardrobeOpened: boolean;
  setWardrobeOpened: (v: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  /** which wardrobe/category the shopper is currently browsing — also drives the companion's outfit */
  activeGender: GenderFilter;
  setActiveGender: (g: GenderFilter) => void;

  selectedPiece: CollectionPiece | null;
  setSelectedPiece: (p: CollectionPiece | null) => void;

  bagItems: BagItem[];
  addToBag: (piece: CollectionPiece, size: string) => void;
  removeFromBag: (pieceId: string, size: string) => void;
  /** sets a line's quantity; 0 or less removes the line */
  setQty: (pieceId: string, size: string, qty: number) => void;
  clearBag: () => void;

  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  cursorLabel: null,
  setCursorLabel: (v) => set({ cursorLabel: v }),

  wardrobeOpened: false,
  setWardrobeOpened: (v) => set({ wardrobeOpened: v }),

  // read synchronously so the very first render (e.g. the Preloader) already
  // knows — useDevicePerformance only keeps it in sync afterwards
  reducedMotion:
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  setReducedMotion: (v) => set({ reducedMotion: v }),

  activeGender: "all",
  setActiveGender: (g) => set({ activeGender: g }),

  selectedPiece: null,
  setSelectedPiece: (p) => set({ selectedPiece: p }),

  bagItems: [],
  addToBag: (piece, size) =>
    set((s) => {
      const existing = s.bagItems.find((i) => i.piece.id === piece.id && i.size === size);
      if (existing) {
        return {
          bagItems: s.bagItems.map((i) =>
            i === existing ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { bagItems: [...s.bagItems, { piece, size, qty: 1 }] };
    }),
  removeFromBag: (pieceId, size) =>
    set((s) => ({
      bagItems: s.bagItems.filter((i) => !(i.piece.id === pieceId && i.size === size)),
    })),
  setQty: (pieceId, size, qty) =>
    set((s) => ({
      bagItems:
        qty <= 0
          ? s.bagItems.filter((i) => !(i.piece.id === pieceId && i.size === size))
          : s.bagItems.map((i) =>
              i.piece.id === pieceId && i.size === size ? { ...i, qty } : i,
            ),
    })),
  clearBag: () => set({ bagItems: [] }),

  bagOpen: false,
  setBagOpen: (v) => set({ bagOpen: v }),
}));
