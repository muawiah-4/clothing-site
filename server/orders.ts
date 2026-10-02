import type { DatabaseSync } from "node:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { COLLECTION } from "../src/data/collection.ts";
import { SIZES } from "./db.ts";

export const CURRENCY = "EUR";
const MAX_LINES = 20;
const MAX_QTY = 10;

/** Server-side price list in integer cents. The client never sends prices. */
const PRICE_CENTS = new Map(COLLECTION.map((p) => [p.id, Math.round(p.price * 100)]));

export const orderRequestSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        productId: z.string().min(1).max(64),
        size: z.enum(SIZES),
        qty: z.number().int().min(1).max(MAX_QTY),
      }),
    )
    .min(1)
    .max(MAX_LINES),
});
export type OrderRequest = z.infer<typeof orderRequestSchema>;

/** RFC-draft style: opaque, bounded, printable. UUIDs fit comfortably. */
export const idempotencyKeySchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
export interface OrderCreated {
  orderId: string;
  totalCents: number;
  currency: typeof CURRENCY;
}
export type OrderResult =
  | { status: 201 | 200; body: OrderCreated }
  | { status: 409 | 422; body: ApiError };

export type StockMap = Record<string, Record<string, number>>;

export function getStock(db: DatabaseSync): StockMap {
  const rows = db.prepare("SELECT product_id, size, stock FROM skus ORDER BY product_id").all() as {
    product_id: string;
    size: string;
    stock: number;
  }[];
  const out: StockMap = {};
  for (const r of rows) (out[r.product_id] ??= {})[r.size] = r.stock;
  return out;
}

/** Merge duplicate product/size lines and sort, so equivalent bags hash equally. */
export function normaliseItems(items: OrderRequest["items"]) {
  const merged = new Map<string, { productId: string; size: string; qty: number }>();
  for (const i of items) {
    const k = `${i.productId}\u0000${i.size}`;
    const prev = merged.get(k);
    merged.set(k, { productId: i.productId, size: i.size, qty: (prev?.qty ?? 0) + i.qty });
  }
  return [...merged.values()].sort((a, b) =>
    a.productId === b.productId ? a.size.localeCompare(b.size) : a.productId.localeCompare(b.productId),
  );
}

/** Price a normalised bag from the catalogue. Returns unknown ids instead of throwing. */
export function priceItems(items: ReturnType<typeof normaliseItems>) {
  const unknown = items.filter((i) => !PRICE_CENTS.has(i.productId)).map((i) => i.productId);
  const lines = items.map((i) => ({ ...i, unitPriceCents: PRICE_CENTS.get(i.productId) ?? 0 }));
  const totalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0);
  return { lines, totalCents, unknown };
}

function replay(db: DatabaseSync, key: string, requestHash: string): OrderResult | null {
  const row = db
    .prepare("SELECT id, subtotal_cents, currency, request_hash FROM orders WHERE idempotency_key = ?")
    .get(key) as { id: string; subtotal_cents: number; currency: string; request_hash: string } | undefined;
  if (!row) return null;
  if (row.request_hash !== requestHash) {
    return {
      status: 422,
      body: {
        error: {
          code: "idempotency_key_reused",
          message: "This Idempotency-Key was already used with a different request body.",
        },
      },
    };
  }
  return { status: 200, body: { orderId: row.id, totalCents: row.subtotal_cents, currency: CURRENCY } };
}

/**
 * Place a demo order: price from the catalogue, check and decrement stock, and
 * record the order — all in one IMMEDIATE transaction, so concurrent writers
 * serialise and stock never goes negative. A repeated Idempotency-Key with the
 * same body returns the original order (200) without touching stock again.
 * Only successful orders are recorded; a 409 can be retried with the same key.
 */
export function placeOrder(db: DatabaseSync, key: string, request: OrderRequest): OrderResult {
  const items = normaliseItems(request.items);
  const requestHash = createHash("sha256").update(JSON.stringify(items)).digest("hex");

  const { lines, totalCents, unknown } = priceItems(items);
  if (unknown.length) {
    return {
      status: 422,
      body: { error: { code: "unknown_product", message: "Unknown product id.", details: { productIds: unknown } } },
    };
  }

  db.exec("BEGIN IMMEDIATE");
  try {
    const existing = replay(db, key, requestHash);
    if (existing) {
      db.exec("ROLLBACK");
      return existing;
    }

    const getSku = db.prepare("SELECT stock FROM skus WHERE product_id = ? AND size = ?");
    const shortages = lines
      .map((l) => ({
        productId: l.productId,
        size: l.size,
        requested: l.qty,
        available: (getSku.get(l.productId, l.size) as { stock: number } | undefined)?.stock ?? 0,
      }))
      .filter((s) => s.available < s.requested);
    if (shortages.length) {
      db.exec("ROLLBACK");
      return {
        status: 409,
        body: {
          error: {
            code: "insufficient_stock",
            message: "Some items don't have enough stock.",
            details: { items: shortages },
          },
        },
      };
    }

    const decrement = db.prepare(
      "UPDATE skus SET stock = stock - ? WHERE product_id = ? AND size = ? AND stock >= ?",
    );
    for (const l of lines) {
      // guarded again at the row level; cannot fail inside IMMEDIATE, but never go negative
      if (decrement.run(l.qty, l.productId, l.size, l.qty).changes !== 1) throw new Error("stock race");
    }

    const orderId = randomUUID();
    db.prepare(
      `INSERT INTO orders (id, created_at, status, subtotal_cents, currency, idempotency_key, request_hash)
       VALUES (?, ?, 'demo-placed', ?, ?, ?, ?)`,
    ).run(orderId, new Date().toISOString(), totalCents, CURRENCY, key, requestHash);
    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, size, qty, unit_price_cents) VALUES (?, ?, ?, ?, ?)",
    );
    for (const l of lines) insertItem.run(orderId, l.productId, l.size, l.qty, l.unitPriceCents);

    db.exec("COMMIT");
    return { status: 201, body: { orderId, totalCents, currency: CURRENCY } };
  } catch (err) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw err;
  }
}
