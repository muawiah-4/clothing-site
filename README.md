# Atelier

A demo storefront for **Atelier — Form in Material**, a fictional fashion house in Paris's
8th arrondissement. It's a single scrolling page with a scroll-driven wardrobe reveal, a
filterable collection with a per-piece buy panel, a bag, a wishlist, and a small Node API
that prices orders and tracks stock per size.

The brand, people, mills and testimonials are fictional. **No payment is ever taken.**
Placing an order records a demo order and decrements stock; nothing ships.

## Features

- **Collection** of 12 pieces (men and women): filter by wardrobe and category, search by
  name, category or fabric, and sort by price.
- **Buy panel** with an image gallery (thumbnails, keyboard switching, click-to-zoom), a size
  guide, sold-out sizes disabled, and "Only N left" warnings from live stock.
- **Bag** with quantity and remove controls. It survives a reload, and prices are re-read
  from the catalogue rather than trusted from storage.
- **Wishlist** ("Saved"): heart toggles on cards and in the buy panel, plus a Saved drawer.
  It is also kept across reloads.
- **Demo checkout** through the API: server-side pricing, a stock check, and duplicate-safe
  ordering.
- **Motion**: smooth scroll, a scroll-driven wardrobe reveal, a pinned lookbook (native
  scroll-snap on touch screens), and a custom cursor. All of it respects
  `prefers-reduced-motion`.
- **Accessibility**: WCAG AA contrast, focus trapping and focus return in every panel (Safari
  included), live-region announcements, and 44px touch targets.

## Getting started

Requires **Node 22.18 or newer**. The API uses the built-in `node:sqlite` module and runs
TypeScript directly.

```bash
npm install
npm run dev        # site on http://localhost:5173, API on :8787 (Vite proxies /api)
```

The SQLite database is created at `data/atelier.db` on first run. It is git-ignored, and stock
is seeded from the catalogue.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite and the API together |
| `npm run dev:web` / `npm run dev:api` | Only the site, or only the API (restarts on change) |
| `npm run build` | Type-check, then build the static site into `dist/` |
| `npm start` | Production: one Node process serves `dist/` (compressed) and `/api`. `PORT` defaults to 8787 |
| `npm run preview` | Serve the static build only (no API) |
| `npm run lint` | Oxlint |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Vitest unit tests (store, persistence, search/sort, focus trap, API) |
| `npm run test:e2e` | Playwright smoke and cross-browser tests in Chromium and WebKit |

For local end-to-end runs against your installed Chrome, set `PLAYWRIGHT_CHROME=1`.

## API

The API is plain `node:http` with SQLite, and every input is validated with zod.

| Route | Description |
| --- | --- |
| `GET /api/health` | `{"status":"ok"}` |
| `GET /api/stock` | `{ productId: { size: stock } }` |
| `POST /api/orders` | Needs an `Idempotency-Key` header. Body is `{ items: [{ productId, size, qty }] }` and the response is `{ orderId, totalCents, currency }`. Prices come only from the catalogue. Repeating a key replays the original response, and not enough stock returns `409` with details |

Errors look like `{ error: { code, message, details? } }`. Responses carry security headers
and `Cache-Control: no-store`, and order creation is rate limited.

## Project structure

```
src/
  sections/    page sections: Hero, BrandStory, WardrobeReveal, Collection, Craft,
               Lookbook, SocialProof, Contact (below-fold ones are lazy-loaded)
  components/  Navbar, BuyPanel, Bag, Wishlist, Cursor, Companion, Preloader, ShimmerImage…
  hooks/       useSmoothScroll (Lenis), useHorizontalScrollGallery, useFocusTrap,
               useDevicePerformance (reduced motion), useStock
  store/       experience.ts: the Zustand store (UI state, bag, wishlist; persisted)
  data/        collection.ts: the catalogue, gallery shots and sizes
  lib/         format (EUR prices), api, collection-query (search/sort), scroll, motion,
               lazySections, focusTrigger
server/        index.ts (HTTP + static serving), app.ts (routes), orders.ts, db.ts
e2e/           Playwright specs
```

## Security

- A strict Content-Security-Policy and security headers come from one source,
  `security-headers.ts`. The build fails if `vercel.json` or `public/_headers` drift from it.
- No secrets live in the repo. `.env` files are git-ignored.
- To report a vulnerability, use GitHub's
  [private vulnerability reporting](https://github.com/muawiah-4/clothing-site/security/advisories/new).

See [SECURITY.md](./SECURITY.md) for details.

## Deploying

- **Static hosts** (Vercel, Netlify, Cloudflare Pages): run `npm run build` and publish `dist/`.
  The headers are already configured, but static hosts can't run the API, so stock and
  checkout won't work there.
- **Node host** (Render, Fly.io, a VPS): run `npm run build`, then `npm start`. This serves the
  full site with the API. The host needs a persistent disk for `data/`.

## Known limitations

- Demo only: there are no payments, accounts or shipping.
- Product photography comes from Unsplash. Some gallery views are close-up crops of the
  piece's main photo.
