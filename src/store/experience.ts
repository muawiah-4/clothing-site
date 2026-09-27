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
  clearBag: () => void;

  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  cursorLabel: null,
  setCursorLabel: (v) => set({ cursorLabel: v }),

  wardrobeOpened: false,
  setWardrobeOpened: (v) => set({ wardrobeOpened: v }),

  reducedMotion: false,
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
  clearBag: () => set({ bagItems: [] }),

  bagOpen: false,
  setBagOpen: (v) => set({ bagOpen: v }),
}));
