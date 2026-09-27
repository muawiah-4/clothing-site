/**
 * The icon+wordmark lockup, matching the favicon: a rounded gradient badge
 * (the same blue→violet→pink canvas colors) with an "A" monogram, in the
 * same style as the reference's icon-before-wordmark nav treatment.
 */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#b9c5f2" />
            <stop offset="0.55" stopColor="#cbb7e6" />
            <stop offset="1" stopColor="#f2c6d8" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="url(#logo-g)" />
        <path
          d="M24 11 34 37h-5.2l-2-5.4H21.2l-2 5.4H14L24 11Zm0 8.6-3 8.2h6l-3-8.2Z"
          fill="#ffffff"
        />
      </svg>
      <span
        className={`font-display text-lg font-semibold tracking-tight ${light ? "text-surface" : "text-ink"}`}
      >
        Atelier
      </span>
    </span>
  );
}
