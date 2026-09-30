/**
 * Single source of truth for the site's Content-Security-Policy and
 * security response headers. See SECURITY.md.
 *
 * Used by vite.config.ts for `vite dev` / `vite preview` headers and for the
 * <meta http-equiv="Content-Security-Policy"> injected into the built
 * index.html. The static host configs (vercel.json, public/_headers) cannot
 * import this file, so they carry a copy — the build fails if either copy
 * drifts from PROD_CSP (see `securityHeaders()` in vite.config.ts).
 */

type Directives = Record<string, string[]>;

const PROD_DIRECTIVES: Directives = {
  "default-src": ["'self'"],
  // no inline scripts anywhere in the built app
  "script-src": ["'self'"],
  // Google Fonts serves the @font-face stylesheet; the font files come from gstatic.
  // The hash is sha256 of the EMPTY string: Motion's <AnimatePresence
  // mode="popLayout"> (Collection filters) appends an empty <style> element and
  // fills it via CSSOM insertRule(). Allowing exactly-empty inline <style> keeps
  // that working without 'unsafe-inline' — any <style> with content is still
  // blocked, and CSSOM calls need script, which is 'self' only.
  "style-src": [
    "'self'",
    "https://fonts.googleapis.com",
    "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
  ],
  "font-src": ["https://fonts.gstatic.com"],
  // product photography is hotlinked from Unsplash; data: covers inline SVG/CSS images
  "img-src": ["'self'", "data:", "https://images.unsplash.com"],
  "media-src": ["'self'"],
  "connect-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  // the only form (newsletter) is handled in JS and never submits
  "form-action": ["'none'"],
  // ignored in <meta>; only effective as a response header
  "frame-ancestors": ["'none'"],
};

/**
 * `vite dev` needs more: @vitejs/plugin-react injects an inline React Refresh
 * preamble script, Vite injects CSS as inline <style> elements, and HMR talks
 * over a websocket. None of this is ever served in a build.
 */
const DEV_DIRECTIVES: Directives = {
  ...PROD_DIRECTIVES,
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "connect-src": ["'self'", "ws://localhost:*", "ws://127.0.0.1:*"],
};

function serialize(directives: Directives, omit: string[] = []): string {
  return Object.entries(directives)
    .filter(([name]) => !omit.includes(name))
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
}

export const PROD_CSP = serialize(PROD_DIRECTIVES);
export const DEV_CSP = serialize(DEV_DIRECTIVES);
/** frame-ancestors is not allowed in a <meta> CSP and would log a console error */
export const META_CSP = serialize(PROD_DIRECTIVES, ["frame-ancestors"]);

const COMMON_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  // legacy fallback for frame-ancestors 'none'
  "X-Frame-Options": "DENY",
};

/** Headers for `vite preview` — the production policy, minus HSTS (served over plain http). */
export const PREVIEW_HEADERS: Record<string, string> = {
  "Content-Security-Policy": PROD_CSP,
  ...COMMON_HEADERS,
};

/** Headers for `vite dev` — relaxed only as far as HMR requires. */
export const DEV_HEADERS: Record<string, string> = {
  "Content-Security-Policy": DEV_CSP,
  ...COMMON_HEADERS,
};
