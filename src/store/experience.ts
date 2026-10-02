import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { COLLECTION, SIZES, type CollectionPiece, type Gender } from "../data/collection";

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

  /** saved piece ids, most recent last */
  wishlist: string[];
  toggleWishlist: (pieceId: string) => void;
  removeFromWishlist: (pieceId: string) => void;

  wishlistOpen: boolean;
  setWishlistOpen: (v: boolean) => void;
}

/** What actually reaches localStorage: ids only, never prices or photo URLs. */
export interface PersistedExperience {
  bagItems: { id: string; size: string; qty: number }[];
  wishlist: string[];
}

export const STORAGE_KEY = "atelier:experience:v1";
const STORAGE_VERSION = 1;
const MAX_QTY = 20;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * localStorage behind try/catch: Safari private mode, a full quota or blocked
 * site data all throw on access, and the bag must keep working in memory then.
 * With no window at all (SSR, workers) nothing is read or written.
 */
const safeLocalStorage: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* quota or blocked storage: keep the in-memory state */
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const PIECES = new Map(COLLECTION.map((p) => [p.id, p]));

/**
 * Rebuilds bag lines from stored data. Anything that isn't a current piece in
 * a real size is dropped, quantities are clamped, duplicate lines merge, and
 * the piece (so its price) always comes from COLLECTION, never from storage.
 */
export function rehydrateBag(raw: unknown): BagItem[] {
  if (!Array.isArray(raw)) return [];
  const lines: BagItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { id, size, qty } = entry as Record<string, unknown>;
    if (typeof id !== "string" || typeof size !== "string") continue;
    const piece = PIECES.get(id);
    if (!piece || !SIZES.includes(size)) continue;
    const n = typeof qty === "number" && Number.isFinite(qty) ? Math.floor(qty) : 0;
    if (n < 1) continue;
    const existing = lines.find((l) => l.piece.id === id && l.size === size);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + n);
    else lines.push({ piece, size, qty: Math.min(MAX_QTY, n) });
  }
  return lines;
}

/** Keeps only ids of current pieces, once each. */
export function rehydrateWishlist(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id): id is string => typeof id === "string" && PIECES.has(id)))];
}

export const useExperienceStore = create<ExperienceState>()(
  persist(
    (set) => ({
      cursorLabel: null,
      setCursorLabel: (v) => set({ cursorLabel: v }),

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

  wishlist: [],
  toggleWishlist: (pieceId) =>
    set((s) => ({
      wishlist: s.wishlist.includes(pieceId)
        ? s.wishlist.filter((id) => id !== pieceId)
        : [...s.wishlist, pieceId],
    })),
  removeFromWishlist: (pieceId) =>
    set((s) => ({ wishlist: s.wishlist.filter((id) => id !== pieceId) })),

  wishlistOpen: false,
  setWishlistOpen: (v) => set({ wishlistOpen: v }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage<PersistedExperience>(() =>
        typeof window === "undefined" ? noopStorage : safeLocalStorage,
      ),
      partialize: (s): PersistedExperience => ({
        bagItems: s.bagItems.map((i) => ({ id: i.piece.id, size: i.size, qty: i.qty })),
        wishlist: s.wishlist,
      }),
      // an older or unknown shape starts fresh rather than half-loading
      migrate: () => ({ bagItems: [], wishlist: [] }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Record<keyof PersistedExperience, unknown>>;
        return {
          ...current,
          bagItems: rehydrateBag(p.bagItems),
          wishlist: rehydrateWishlist(p.wishlist),
        };
      },
    },
  ),
);
