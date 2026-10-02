import { useEffect, useSyncExternalStore } from "react";
import { fetchStock, type StockMap } from "../lib/api";

/** at or below this many left, a size counts as low */
export const LOW_STOCK = 3;

export type PieceStockStatus = "sold-out" | "low" | null;

/**
 * Card-level signal: "sold-out" when every size is gone, "low" when every
 * size is low or gone, and null otherwise — including when any count is
 * unknown (loading, or the API is down), so nothing is claimed without data.
 */
export function pieceStockStatus(counts: (number | null)[]): PieceStockStatus {
  if (counts.length === 0 || counts.some((c) => c === null)) return null;
  const known = counts as number[];
  if (known.every((c) => c <= 0)) return "sold-out";
  if (known.every((c) => c <= LOW_STOCK)) return "low";
  return null;
}

type StockState =
  | { status: "loading"; stock: null }
  | { status: "ready"; stock: StockMap }
  /** the API isn't running (e.g. a static-only deploy) — callers fall back to "everything available" */
  | { status: "unavailable"; stock: null };

// One shared snapshot for the whole app, fetched on first use and refreshed
// after an order, so every BuyPanel sees the same numbers.
let state: StockState = { status: "loading", stock: null };
let inflight: Promise<void> | null = null;
let fetched = false;
const listeners = new Set<() => void>();

function set(next: StockState) {
  state = next;
  for (const l of listeners) l();
}

export function refreshStock(): Promise<void> {
  inflight ??= fetchStock().then((stock) => {
    inflight = null;
    fetched = true;
    set(stock ? { status: "ready", stock } : { status: "unavailable", stock: null });
  });
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Live per-size stock from GET /api/stock.
 * `left(productId, size)` is the count, or null when unknown (loading / API down).
 */
export function useStock() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => {
    if (!fetched) void refreshStock();
  }, []);
  return {
    ...snapshot,
    left: (productId: string, size: string): number | null => snapshot.stock?.[productId]?.[size] ?? null,
  };
}
