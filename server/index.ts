/**
 * Atelier API server.
 *
 *   node server/index.ts               API only (vite proxies /api here in dev/preview)
 *   node server/index.ts --serve-dist  API + the built site from dist/ (npm start)
 *
 * Env: PORT or API_PORT (default 8787), HOST (default 127.0.0.1), DB_PATH (default data/atelier.db)
 */
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import path from "node:path";
import { openDb } from "./db.ts";
import { createApp } from "./app.ts";

const root = path.resolve(import.meta.dirname, "..");
// API_PORT is what vite.config.ts proxies to; PORT is the usual host convention for `npm start`
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";
const dbPath = path.resolve(root, process.env.DB_PATH ?? "data/atelier.db");
const serveDist = process.argv.includes("--serve-dist");
const staticDir = path.join(root, "dist");

if (serveDist && !existsSync(path.join(staticDir, "index.html"))) {
  console.error("dist/index.html not found — run `npm run build` first.");
  process.exit(1);
}

const db = openDb(dbPath);
const server = createServer(createApp({ db, staticDir: serveDist ? staticDir : undefined }));
server.headersTimeout = 10_000;
server.requestTimeout = 15_000;
server.keepAliveTimeout = 5_000;

server.listen(port, host, () => {
  console.log(
    JSON.stringify({ level: "info", msg: "listening", url: `http://${host}:${port}`, db: dbPath, serveDist }),
  );
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3_000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
