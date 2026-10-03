// Safari doesn't focus a <button> or <a> on mouse click, so when a click opens a
// panel document.activeElement is <body> and there'd be nothing to return focus
// to on close. Remember the control the pointer last pressed (capture phase,
// before any handler opens a panel); a key press means keyboard use, where
// focus is already right.
//
// Imported for its side effect from main.tsx: the panels live in lazy chunks,
// so a listener registered there would only exist after the first click.
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

let lastPressed: HTMLElement | null = null

if (typeof document !== 'undefined') {
  document.addEventListener(
    'pointerdown',
    (e) => {
      lastPressed = e.target instanceof Element ? e.target.closest<HTMLElement>(FOCUSABLE) : null
    },
    true,
  )
  document.addEventListener('keydown', () => (lastPressed = null), true)
}

/** The element that opened a panel: the focused one, or in Safari the one just clicked. */
export function getTrigger(): HTMLElement | null {
  const active = document.activeElement
  if (active instanceof HTMLElement && active !== document.body) return active
  return lastPressed?.isConnected ? lastPressed : null
}
