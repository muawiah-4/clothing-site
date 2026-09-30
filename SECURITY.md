# Security

## What this site is

Atelier is a **static demo storefront**: a client-only React + Vite single-page app with
no backend, no accounts, no database and no API.

- **No payments.** "Place demo order" in the Bag only clears the in-memory bag. No payment
  or delivery details are collected and nothing is sent anywhere. The UI says so before
  and after the click.
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

The two host files can't import TypeScript, so each carries a copy of the CSP.
`npm run build` fails if either copy differs from `security-headers.ts`. When you change
the policy, update all three.

If you add a new third-party origin (analytics, a CDN, an embed), add it to the matching
directive in `security-headers.ts`, `vercel.json` and `public/_headers`. Then run
`npm run build && npx vite preview` and check the browser console for CSP violations.

## Reporting a vulnerability

Please report security issues privately. Don't open a public issue. Email the
maintainer at the address on the repository owner's profile. Include steps to
reproduce and the affected URL or commit. We aim to acknowledge reports within
3 business days.
