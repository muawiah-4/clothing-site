import { useEffect, useSyncExternalStore } from "react";
import { fetchStock, type StockMap } from "../lib/api";

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
