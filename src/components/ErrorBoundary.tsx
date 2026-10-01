import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Top-level safety net. Catches render errors anywhere below it and shows a
 * calm, on-brand fallback instead of a blank white screen — there is no
 * recovery path to retry into (the whole tree already failed once), so the
 * only honest action offered is a full reload.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Reported to the console rather than a telemetry service — this is a
    // demo site with no error-reporting backend wired up.
    console.error('[Atelier] Unhandled error:', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          padding: '2rem',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, var(--color-canvas-a, #b9c5f2), var(--color-canvas-b, #cbb7e6) 55%, var(--color-canvas-c, #f2c6d8))',
          fontFamily:
            'var(--font-sans, "Inter Variable", ui-sans-serif, system-ui, sans-serif)',
          color: 'var(--color-ink, #363b4a)',
        }}
      >
        <p
          style={{
            fontFamily:
              'var(--font-display, "Fraunces Variable", Georgia, serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            maxWidth: '32rem',
            margin: 0,
          }}
        >
          Something went wrong. Reload the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: 'var(--color-accent, #178098)',
            color: 'var(--color-surface, #ffffff)',
            border: 'none',
            borderRadius: '999px',
            padding: '0.75rem 1.75rem',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    )
  }
}
