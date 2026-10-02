// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { DatabaseSync } from "node:sqlite";
import { openDb, seedStock, SIZES } from "./db.ts";
import { getStock, placeOrder, type StockMap } from "./orders.ts";
import { createApp } from "./app.ts";
import { COLLECTION } from "../src/data/collection.ts";

let db: DatabaseSync;
beforeEach(() => {
  db = openDb(":memory:");
});
afterEach(() => db.close());

const setStock = (productId: string, size: string, stock: number) =>
  db.prepare("UPDATE skus SET stock = ? WHERE product_id = ? AND size = ?").run(stock, productId, size);
const stockOf = (productId: string, size: string) => getStock(db)[productId][size];

describe("seed", () => {
  it("creates one SKU per product × size, with some sold out and some low", () => {
    const stock = getStock(db);
    expect(Object.keys(stock).sort()).toEqual(COLLECTION.map((p) => p.id).sort());
    const all = COLLECTION.flatMap((p) => SIZES.map((s) => stock[p.id][s]));
    expect(all).toHaveLength(COLLECTION.length * SIZES.length);
    expect(all.some((n) => n === 0)).toBe(true);
    expect(all.some((n) => n >= 1 && n <= 3)).toBe(true);
    expect(stock.nocturne.M).toBe(seedStock("nocturne", "M"));
  });
});

describe("placeOrder", () => {
  it("prices from catalogue ids and merges duplicate lines", () => {
    setStock("nocturne", "M", 5);
    setStock("colonnade", "L", 5);
    const r = placeOrder(db, "key-pricing-1", {
      items: [
        { productId: "nocturne", size: "M", qty: 1 },
        { productId: "colonnade", size: "L", qty: 2 },
        { productId: "nocturne", size: "M", qty: 1 },
      ],
    });
    expect(r.status).toBe(201);
    // 2 × 1980 + 2 × 2150
    expect(r.body).toMatchObject({ totalCents: 826_000, currency: "EUR" });
    const items = db.prepare("SELECT product_id, size, qty, unit_price_cents FROM order_items ORDER BY product_id").all();
    expect(items).toEqual([
      { product_id: "colonnade", size: "L", qty: 2, unit_price_cents: 215_000 },
      { product_id: "nocturne", size: "M", qty: 2, unit_price_cents: 198_000 },
    ]);
  });

  it("rejects unknown product ids with 422", () => {
    const r = placeOrder(db, "key-unknown-1", { items: [{ productId: "nope", size: "M", qty: 1 }] });
    expect(r.status).toBe(422);
    expect(r.body).toMatchObject({ error: { code: "unknown_product" } });
  });

  it("decrements stock, then returns 409 with details when insufficient", () => {
    setStock("nocturne", "S", 2);
    setStock("colonnade", "S", 9);
    expect(placeOrder(db, "key-stock-1", { items: [{ productId: "nocturne", size: "S", qty: 2 }] }).status).toBe(201);
    expect(stockOf("nocturne", "S")).toBe(0);

    const r = placeOrder(db, "key-stock-2", {
      items: [
        { productId: "colonnade", size: "S", qty: 1 },
        { productId: "nocturne", size: "S", qty: 1 },
      ],
    });
    expect(r.status).toBe(409);
    expect(r.body).toEqual({
      error: {
        code: "insufficient_stock",
        message: expect.any(String),
        details: { items: [{ productId: "nocturne", size: "S", requested: 1, available: 0 }] },
      },
    });
    // all-or-nothing: the in-stock line was not decremented either
    expect(stockOf("colonnade", "S")).toBe(9);
    expect(db.prepare("SELECT COUNT(*) AS n FROM orders").get()).toEqual({ n: 1 });
  });

  it("replays the same response for the same key without decrementing again", () => {
    setStock("nocturne", "XL", 3);
    const req = { items: [{ productId: "nocturne", size: "XL" as const, qty: 1 }] };
    const first = placeOrder(db, "key-replay-1", req);
    const second = placeOrder(db, "key-replay-1", req);
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(stockOf("nocturne", "XL")).toBe(2);
  });

  it("rejects a reused key with a different body", () => {
    setStock("nocturne", "XL", 3);
    placeOrder(db, "key-reuse-1", { items: [{ productId: "nocturne", size: "XL", qty: 1 }] });
    const r = placeOrder(db, "key-reuse-1", { items: [{ productId: "nocturne", size: "XL", qty: 2 }] });
    expect(r.status).toBe(422);
    expect(r.body).toMatchObject({ error: { code: "idempotency_key_reused" } });
    expect(stockOf("nocturne", "XL")).toBe(2);
  });
});

describe("HTTP", () => {
  let server: Server;
  let base: string;
  beforeEach(async () => {
    server = createServer(createApp({ db, log: () => {} }));
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterEach(() => new Promise<void>((r) => server.close(() => r())));

  const post = (body: unknown, key?: string) =>
    fetch(`${base}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { "Idempotency-Key": key } : {}) },
      body: JSON.stringify(body),
    });

  it("serves health and stock with security headers", async () => {
    const health = await fetch(`${base}/api/health`);
    expect(await health.json()).toEqual({ status: "ok" });
    expect(health.headers.get("content-security-policy")).toBe("default-src 'none'; frame-ancestors 'none'");
    expect(health.headers.get("x-content-type-options")).toBe("nosniff");
    expect(health.headers.get("cache-control")).toBe("no-store");
    const stock = (await (await fetch(`${base}/api/stock`)).json()) as StockMap;
    expect(stock.nocturne.M).toBe(seedStock("nocturne", "M"));
  });

  it("requires an Idempotency-Key and validates the body", async () => {
    expect((await post({ items: [{ productId: "nocturne", size: "M", qty: 1 }] })).status).toBe(400);
    const bad = await post({ items: [{ productId: "nocturne", size: "XXL", qty: 1, price: 1 }] }, "key-http-bad");
    expect(bad.status).toBe(422);
    expect(await bad.json()).toMatchObject({ error: { code: "invalid_request" } });
  });

  it("creates, replays and refuses an oversell", async () => {
    setStock("nocturne", "M", 1);
    const body = { items: [{ productId: "nocturne", size: "M", qty: 1 }] };
    const created = await post(body, "key-http-1");
    expect(created.status).toBe(201);
    const replayed = await post(body, "key-http-1");
    expect(replayed.status).toBe(200);
    expect(replayed.headers.get("idempotent-replayed")).toBe("true");
    expect(await replayed.json()).toEqual(await created.json());
    expect((await post(body, "key-http-2")).status).toBe(409);
  });
});
