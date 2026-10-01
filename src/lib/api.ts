/**
 * Client for the demo API (server/). Same-origin /api only, so it is covered
 * by connect-src 'self'. Every call resolves to a result; nothing throws.
 */

export type StockMap = Record<string, Record<string, number>>;

export interface OrderLine {
  productId: string;
  size: string;
  qty: number;
}

export interface OrderConfirmation {
  orderId: string;
  totalCents: number;
  currency: string;
}

export interface StockShortage {
  productId: string;
  size: string;
  requested: number;
  available: number;
}

export type OrderResult =
  | { ok: true; order: OrderConfirmation }
  | { ok: false; kind: "stock"; message: string; shortages: StockShortage[] }
  | { ok: false; kind: "unreachable" | "error"; message: string };

const TIMEOUT_MS = 8000;

export async function fetchStock(): Promise<StockMap | null> {
  try {
    const res = await fetch("/api/stock", { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
    return (await res.json()) as StockMap;
  } catch {
    return null;
  }
}

export async function placeOrder(items: OrderLine[], idempotencyKey: string): Promise<OrderResult> {
  let res: Response;
  try {
    res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ items }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { ok: false, kind: "unreachable", message: UNREACHABLE };
  }
  // a static host without the API answers with index.html or a 404 page
  if (!res.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, kind: "unreachable", message: UNREACHABLE };
  }
  const body = (await res.json().catch(() => null)) as
    | (OrderConfirmation & { error?: { code?: string; message?: string; details?: { items?: StockShortage[] } } })
    | null;
  if (res.ok && body?.orderId) return { ok: true, order: body };
  if (res.status === 409 && body?.error?.details?.items) {
    return { ok: false, kind: "stock", message: body.error.message ?? "", shortages: body.error.details.items };
  }
  return {
    ok: false,
    kind: "error",
    message: body?.error?.message ?? "The order couldn't be placed. Please try again.",
  };
}

const UNREACHABLE =
  "We couldn't reach the order service, so nothing was placed. Your bag is unchanged — please try again in a moment.";

/** Format integer cents in the currency the server priced the order in. */
export function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}
