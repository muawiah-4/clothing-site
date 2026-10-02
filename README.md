# Atelier

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

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
