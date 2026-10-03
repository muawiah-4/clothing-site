import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// self-hosted variable fonts (latin faces are the only ones downloaded; the
// other subsets are unicode-range gated). Fraunces keeps its opsz axis, which
// the old Google Fonts request asked for; Inter only needs wght.
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'
// before any lazy panel loads: records the pointer-pressed trigger for focus return
import './lib/focusTrigger.ts'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
