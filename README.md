# Atelier

A fictional Paris fashion house — a single-page demo storefront with a cinematic,
scroll-driven experience: a hero reveal, a wardrobe/collection browser with
per-piece buy panel, a shopping bag, and a "companion" mascot that reacts to
what's being browsed. Built to explore high-craft motion and performance
budgets on the front end, not to process real orders.

## Running it (Node ≥ 22.18; uses built-in `node:sqlite` and TypeScript type stripping)

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite on :5173 and the API on :8787. Vite proxies `/api` to the API. |
| `npm run dev:api` | The API alone, restarting on change. Creates `data/atelier.db` on first run. |
| `npm run build` | The static site in `dist/`. Unchanged; no server needed. |
| `npm start` | Production: one Node process serves `dist/` and `/api` (`PORT`, default 8787). |
| `npm test` | Vitest: pricing, stock and 409s, idempotent replay, HTTP headers. |

API: `GET /api/health`, `GET /api/stock` → `{productId: {size: stock}}`, and
`POST /api/orders` (needs an `Idempotency-Key` header) with body `{items:[{productId,size,qty}]}`
→ `{orderId,totalCents,currency}`. Insufficient stock returns 409. There are no payments.
Static hosts can't run the API, so checkout needs a Node host. See
[SECURITY.md](./SECURITY.md#deploying).

## Stack

- **React 19** + **TypeScript**, built with **Vite 8**
- **Zustand** for the single client store (`src/store/experience.ts`) — cursor
  state, reduced-motion flag, active gender filter, selected piece, and the bag
- **Tailwind CSS 4** (via `@tailwindcss/vite`) for styling
- **Lenis** for smooth scrolling, **GSAP** for scroll-triggered choreography,
  and **Motion** (`motion/react`, loaded via `LazyMotion` + `m` components) for
  component-level animation
- **Vitest** + **React Testing Library** for unit tests, **Playwright** for
  end-to-end smoke tests
- **Oxlint** for linting

## Scripts

```bash
npm run dev         # start the Vite dev server
npm run build        # tsc -b (project-wide typecheck) then vite build
npm run preview       # serve the production build locally
npm run lint          # oxlint
npm run typecheck      # tsc -b --noEmit, no build output
npm run test           # vitest run (unit tests)
npm run test:e2e        # playwright test (end-to-end smoke tests)
```

## Project structure

```
src/
  sections/    top-level page sections mounted by App.tsx (Hero, BrandStory,
               WardrobeReveal, Collection, Craft, Lookbook, SocialProof, Contact)
  components/   shared UI: Navbar, Cursor, Companion, Bag, BuyPanel, Preloader,
                MagneticButton, ShimmerImage, SplitReveal, FilterPills, etc.
  hooks/        useSmoothScroll (Lenis setup), useHorizontalScrollGallery,
                useFocusTrap (keyboard trap + focus restore for overlays),
                useDevicePerformance (syncs prefers-reduced-motion into the store)
  store/        experience.ts — the one Zustand store for UI + bag state
  data/         collection.ts — the static product catalogue
  lib/          format.ts (price formatting), motion.ts (shared Motion
                presets), scroll.ts (Lenis lock/unlock + scrollTo), lazySections.ts
```

Sections and overlays (buy panel, bag, mobile menu, the companion mascot) are
code-split and lazy-loaded; `lazySections.ts` owns the loaders and a shared
"mounted" signal so scroll-to-section navigation can wait for a lazy section
to exist before scrolling to it.

## Animation architecture

Three motion systems are deliberately layered, each doing the job it's best at:

- **Lenis** owns the physical scroll (`useSmoothScroll`, `lib/scroll.ts`).
  Overlays call `lockScroll()` / `unlockScroll()` (reference-counted, since
  more than one overlay can be open) instead of touching `body.overflow`
  directly, so Lenis and native scroll-locking never fight each other.
- **GSAP** (with ScrollTrigger) drives the larger choreographed sequences
  tied to scroll position — the wardrobe reveal and horizontal gallery.
- **Motion** (`motion/react`) handles component-level enter/exit and hover
  animation, loaded through `LazyMotion` with the `domAnimation` feature
  bundle so the full Motion feature set isn't shipped to every page. Shared
  presets live in `lib/motion.ts`.

**Reduced motion** is read synchronously at store creation (so even the very
first paint, the Preloader, already knows) and then kept in sync by
`useDevicePerformance`, which listens for `matchMedia("(prefers-reduced-motion: reduce)")`
changes. Consumers read `reducedMotion` from the store rather than relying on
a CSS media query, because Motion's own animation engine doesn't honor that
media query on its own — each call site (e.g. `lib/motion.ts`'s `fade()`)
checks the flag and swaps in a near-instant transition.

## Security

See [SECURITY.md](./SECURITY.md) for the reporting policy. In short: a strict
Content-Security-Policy is enforced both at build time (`vite.config.ts`
fails the build if `public/_headers` or `vercel.json` drift from
`security-headers.ts`) and at runtime via each host's header configuration —
there is one source of truth for the policy, not three copies to keep in sync
by hand.

## Deploy

Static build, deployable to either:

- **Vercel** — `vercel.json` carries the security headers.
- **Netlify** — `public/_headers` carries the same headers for that host.

`npm run build` outputs to `dist/`; either platform just needs that as the
publish directory with `npm run build` as the build command.

## Known limitations

This is a front-end demo, not a working store:

- **No payments.** The buy panel and bag simulate adding pieces and choosing
  a size; there is no checkout, no payment processor, and no order ever
  leaves the browser.
- **No backend.** The catalogue in `src/data/collection.ts` is static; there
  is no inventory, pricing, or account system behind it.
- **No persistence.** The bag lives in memory only (Zustand, not persisted to
  storage) — it resets on reload.
