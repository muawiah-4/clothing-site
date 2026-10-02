import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { createReadStream, readFileSync, statSync } from "node:fs";
import { brotliCompressSync, constants as zlib, gzipSync } from "node:zlib";
import path from "node:path";
import { API_HEADERS, PROD_HEADERS } from "../security-headers.ts";
import { getStock, idempotencyKeySchema, orderRequestSchema, placeOrder } from "./orders.ts";

const MAX_BODY_BYTES = 16 * 1024;
const ORDER_RATE = { limit: 30, windowMs: 60_000 };

export interface AppOptions {
  db: DatabaseSync;
  /** serve this directory (the built site) for non-/api requests */
  staticDir?: string;
  log?: (entry: Record<string, unknown>) => void;
}

class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...API_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    ...extra,
  });
  res.end(payload);
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const type = req.headers["content-type"] ?? "";
  if (!/^application\/json\b/i.test(type)) {
    throw new HttpError(415, "unsupported_media_type", "Content-Type must be application/json.");
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large", "Request body is too large.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "invalid_json", "Request body is not valid JSON.");
  }
}

/** Fixed-window limiter per client address; enough to stop a runaway loop in a demo. */
function createRateLimiter({ limit, windowMs }: typeof ORDER_RATE) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (client: string): number | null => {
    const now = Date.now();
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    const entry = hits.get(client);
    if (!entry || entry.resetAt <= now) {
      hits.set(client, { count: 1, resetAt: now + windowMs });
      return null;
    }
    entry.count += 1;
    return entry.count > limit ? Math.ceil((entry.resetAt - now) / 1000) : null;
  };
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function serveStatic(root: string, req: IncomingMessage, res: ServerResponse, pathname: string) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { ...PROD_HEADERS, Allow: "GET, HEAD" }).end();
    return;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400, PROD_HEADERS).end();
    return;
  }
  // resolve inside root only; anything escaping it (../, absolute) falls through to index.html
  let file = path.resolve(root, `.${path.posix.normalize(decoded)}`);
  if (!file.startsWith(root + path.sep) || path.basename(file).startsWith(".")) file = path.join(root, "index.html");
  let stat = statSafe(file);
  if (!stat?.isFile()) {
    // SPA fallback for extensionless routes; real missing assets 404
    if (path.extname(decoded)) {
      res.writeHead(404, { ...PROD_HEADERS, "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    file = path.join(root, "index.html");
    stat = statSafe(file);
    if (!stat) {
      res.writeHead(404, PROD_HEADERS).end();
      return;
    }
  }
  const immutable = file.startsWith(path.join(root, "assets") + path.sep);
  const headers = {
    ...PROD_HEADERS,
    "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
  };
  const compressed = COMPRESSIBLE.has(path.extname(file).toLowerCase())
    ? compress(file, stat.mtimeMs, req.headers["accept-encoding"])
    : null;
  if (compressed) {
    res.writeHead(200, {
      ...headers,
      "Content-Encoding": compressed.encoding,
      "Content-Length": compressed.body.length,
      Vary: "Accept-Encoding",
    });
    res.end(req.method === "HEAD" ? undefined : compressed.body);
    return;
  }
  res.writeHead(200, { ...headers, "Content-Length": stat.size });
  if (req.method === "HEAD") res.end();
  else createReadStream(file).pipe(res);
}

// Text assets are sent brotli/gzip-compressed (most hosts do this for you;
// `npm start` has to do it itself). The built files are few and immutable, so
// each encoding is compressed once and kept, keyed by path + mtime.
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".svg", ".json", ".txt"]);
const compressedCache = new Map<string, Buffer>();

function compress(file: string, mtimeMs: number, acceptEncoding: string | string[] | undefined) {
  const accepted = String(acceptEncoding ?? "");
  const encoding = /\bbr\b/.test(accepted) ? "br" : /\bgzip\b/.test(accepted) ? "gzip" : null;
  if (!encoding) return null;
  const key = `${encoding}:${mtimeMs}:${file}`;
  let body = compressedCache.get(key);
  if (!body) {
    const raw = readFileSync(file);
    body =
      encoding === "br"
        ? brotliCompressSync(raw, { params: { [zlib.BROTLI_PARAM_QUALITY]: 11, [zlib.BROTLI_PARAM_SIZE_HINT]: raw.length } })
        : gzipSync(raw, { level: 9 });
    compressedCache.set(key, body);
  }
  return { encoding, body };
}

function statSafe(file: string) {
  try {
    return statSync(file);
  } catch {
    return null;
  }
}

export function createApp({ db, staticDir, log = (e) => console.log(JSON.stringify(e)) }: AppOptions) {
  const limitOrders = createRateLimiter(ORDER_RATE);
  const root = staticDir ? path.resolve(staticDir) : undefined;

  async function handleApi(req: IncomingMessage, res: ServerResponse, pathname: string) {
    const route = `${req.method} ${pathname}`;
    switch (route) {
      case "GET /api/health": {
        db.prepare("SELECT 1").get();
        return sendJson(res, 200, { status: "ok" });
      }
      case "GET /api/stock":
        return sendJson(res, 200, getStock(db));
      case "POST /api/orders": {
        const retryAfter = limitOrders(req.socket.remoteAddress ?? "unknown");
        if (retryAfter !== null) {
          return sendJson(
            res,
            429,
            { error: { code: "rate_limited", message: "Too many orders; try again shortly." } },
            { "Retry-After": String(retryAfter) },
          );
        }
        const key = idempotencyKeySchema.safeParse(req.headers["idempotency-key"]);
        if (!key.success) {
          throw new HttpError(
            400,
            "invalid_idempotency_key",
            "An Idempotency-Key header (8–128 chars of A–Z a–z 0–9 . _ : -) is required.",
          );
        }
        const body = orderRequestSchema.safeParse(await readJson(req));
        if (!body.success) {
          throw new HttpError(422, "invalid_request", "Request body failed validation.", body.error.issues.map(
            (i) => ({ path: i.path.join("."), message: i.message }),
          ));
        }
        const result = placeOrder(db, key.data, body.data);
        const extra: Record<string, string> = { "Idempotency-Key": key.data };
        if (result.status === 200) extra["Idempotent-Replayed"] = "true";
        if (result.status === 201) extra.Location = `/api/orders/${result.body.orderId}`;
        return sendJson(res, result.status, result.body, extra);
      }
    }
    if (["/api/health", "/api/stock", "/api/orders"].includes(pathname)) {
      const allow = pathname === "/api/orders" ? "POST" : "GET";
      return sendJson(res, 405, { error: { code: "method_not_allowed", message: `Use ${allow}.` } }, { Allow: allow });
    }
    return sendJson(res, 404, { error: { code: "not_found", message: "No such endpoint." } });
  }

  return async function handler(req: IncomingMessage, res: ServerResponse) {
    const started = performance.now();
    const requestId = randomUUID();
    res.setHeader("X-Request-Id", requestId);
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    try {
      if (pathname === "/api" || pathname.startsWith("/api/")) {
        await handleApi(req, res, pathname);
      } else if (root) {
        serveStatic(root, req, res, pathname);
      } else {
        sendJson(res, 404, { error: { code: "not_found", message: "No such endpoint." } });
      }
    } catch (err) {
      if (err instanceof HttpError) {
        sendJson(res, err.status, { error: { code: err.code, message: err.message, details: err.details } });
      } else {
        log({ level: "error", msg: "unhandled", requestId, error: String(err) });
        if (!res.headersSent) sendJson(res, 500, { error: { code: "internal", message: "Something went wrong." } });
        else res.destroy();
      }
    } finally {
      if (pathname.startsWith("/api")) {
        log({
          level: "info",
          requestId,
          method: req.method,
          path: pathname,
          status: res.statusCode,
          ms: Math.round(performance.now() - started),
        });
      }
    }
  };
}
