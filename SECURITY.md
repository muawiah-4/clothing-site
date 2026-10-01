# Security

## What this site is

Atelier is a **demo storefront**: a React + Vite single-page app plus a small Node API
(`server/`) for stock and demo orders. There are no accounts and no payments.

- **No payments, no PII.** "Place demo order" POSTs `{items:[{productId,size,qty}]}` to
  `/api/orders`. No payment, delivery or personal details are collected or stored. The
  database (`data/atelier.db`, SQLite, gitignored) holds only SKU stock, order ids, line
  items, totals and the idempotency key. The UI says so before and after the click.
- **Server-side pricing.** The API prices orders from `src/data/collection.ts`. The client
  never sends prices, and unknown fields are rejected (zod strict schemas). Stock is
  checked and decremented in one `BEGIN IMMEDIATE` transaction, so it can't oversell.
- **Abuse limits.** Bodies over 16 KB are rejected, `Content-Type` must be
  `application/json`, `POST /api/orders` is rate-limited per client address (30/min),
  quantities are capped (≤10 per line, ≤20 lines) and every order needs an
  `Idempotency-Key` header, so a retried request can't create a second order.
- **No data collection.** The newsletter field is validated in the browser and then
  discarded. It is never sent, stored or rendered back into the page.
- **Third parties.** Product photos are hotlinked from `images.unsplash.com`, sent
  with no referrer. Fonts (Fraunces, Inter) are self-hosted from `@fontsource-variable`
  packages and served from the site's own origin.
- **No secrets.** The app needs no API keys or environment secrets. `.gitignore` excludes
  `.env*` (except `.env.example`) and key/certificate files anyway.

## Headers and Content-Security-Policy

`security-headers.ts` is the single source of truth. The production policy is:

```
default-src 'self'; script-src 'self'; style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='; font-src 'self'; img-src 'self' data: https://images.unsplash.com; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
```

There is no `'unsafe-inline'` and no `'unsafe-eval'`. The one hash is the SHA-256 of the
**empty string**. Motion's `AnimatePresence mode="popLayout"` (used by the Collection
filters) appends an empty `<style>` element and fills it through CSSOM `insertRule()`.
The hash allows only that empty element. Any `<style>` with content is still blocked.

Other headers sent with every response:

| Header | Value |
| --- | --- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (deploy configs only) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `X-Frame-Options` | `DENY` (legacy fallback for `frame-ancestors 'none'`) |

Where they are applied:

| Where | File | Notes |
| --- | --- | --- |
| Vercel | `vercel.json` | Full set, including HSTS |
| Netlify / Cloudflare Pages | `public/_headers` (copied to `dist/`) | Full set, including HSTS |
| Built `index.html` | injected by `vite.config.ts` at build time | CSP `<meta>` baseline, minus `frame-ancestors` (ignored in meta) |
| `vite preview` | `vite.config.ts` → `preview.headers` | Production CSP, no HSTS (plain http) |
| `vite dev` | `vite.config.ts` → `server.headers` | Dev CSP adds `'unsafe-inline'` for scripts/styles (React Refresh preamble, Vite's injected CSS) and `ws://localhost:*` / `ws://127.0.0.1:*` for HMR |

| `npm start` (Node) | `server/app.ts` → `PROD_HEADERS` | Full set, including HSTS, for `dist/` |
| `/api/*` responses | `server/app.ts` → `API_HEADERS` | `default-src 'none'; frame-ancestors 'none'`, `Cache-Control: no-store`, `Cross-Origin-Resource-Policy: same-origin`, plus the common headers and HSTS |

The two host files can't import TypeScript, so each carries a copy of the CSP.
`npm run build` fails if either copy differs from `security-headers.ts`. When you change
the policy, update all three.

If you add a new third-party origin (analytics, a CDN, an embed), add it to the matching
directive in `security-headers.ts`, `vercel.json` and `public/_headers`. Then run
`npm run build && npx vite preview` and check the browser console for CSP violations.

## Deploying

The API is same-origin (`/api`), so `connect-src 'self'` covers it and no CSP change is
needed. Where it runs depends on the host:

- **Static hosts (Vercel static, Netlify, Cloudflare Pages).** They serve `dist/` with
  the headers above but **can't run the API**. The site still works: sizes show as
  available and "Place demo order" shows an inline "couldn't reach the order service"
  message instead of placing an order.
- **Node host (Fly.io, Render, Railway, a VM).** Run `npm ci && npm run build && npm start`.
  One process serves `dist/` with `PROD_HEADERS` and the API with `API_HEADERS`. Set
  `HOST=0.0.0.0`, `PORT`, and `DB_PATH` on a persistent volume. Terminate TLS in front of
  it. The server runs as a single process because SQLite is a local file, so don't
  scale it horizontally.

## Reporting a vulnerability

Please report security issues privately. Don't open a public issue. Email the
maintainer at the address on the repository owner's profile. Include steps to
reproduce and the affected URL or commit. We aim to acknowledge reports within
3 business days.
