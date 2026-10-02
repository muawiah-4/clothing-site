import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { COLLECTION } from "../src/data/collection.ts";

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS skus (
  product_id TEXT NOT NULL,
  size       TEXT NOT NULL CHECK (size IN ('XS','S','M','L','XL')),
  stock      INTEGER NOT NULL CHECK (stock >= 0),
  PRIMARY KEY (product_id, size)
) STRICT;

CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  created_at       TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('demo-placed')),
  subtotal_cents   INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  currency         TEXT NOT NULL CHECK (currency IN ('EUR')),
  idempotency_key  TEXT NOT NULL UNIQUE,
  -- sha256 of the normalised request, so a reused key with a different body is rejected
  request_hash     TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS order_items (
  order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  size              TEXT NOT NULL,
  qty               INTEGER NOT NULL CHECK (qty > 0),
  unit_price_cents  INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  PRIMARY KEY (order_id, product_id, size)
) STRICT;
`;

/**
 * Plausible, deterministic demo stock: a stable hash of product+size picks a
 * bucket, so every fresh database looks the same and a few sizes are sold out
 * or low. The mid sizes run a little deeper than the extremes.
 */
export function seedStock(productId: string, size: Size): number {
  let h = 2166136261;
  for (const ch of `${productId}:${size}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const bucket = h % 10;
  if (bucket === 0) return 0;
  if (bucket <= 2) return 1 + (h % 3); // 1–3: "Only N left"
  const depth = size === "S" || size === "M" || size === "L" ? 6 : 3;
  return depth + (h % 7);
}

/** Open (or create) the database, apply the schema and seed any missing SKUs. */
export function openDb(file: string): DatabaseSync {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  const insert = db.prepare("INSERT OR IGNORE INTO skus (product_id, size, stock) VALUES (?, ?, ?)");
  db.exec("BEGIN");
  for (const piece of COLLECTION) {
    for (const size of SIZES) insert.run(piece.id, size, seedStock(piece.id, size));
  }
  db.exec("COMMIT");
  return db;
}
