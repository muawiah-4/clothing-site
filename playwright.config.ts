import { defineConfig, devices } from '@playwright/test'

// E2E_PORT lets parallel checkouts (worktrees) run their own server side by side.
const PORT = Number(process.env.E2E_PORT ?? 4441)
const API_PORT = PORT + 100
const LOCAL_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// PLAYWRIGHT_CHROME lets local runs drive the real, already-licensed/installed
// Chrome instead of downloading Playwright's bundled Chromium: set it to "1"
// for the default local install path above, or to a custom path directly.
const executablePath = process.env.PLAYWRIGHT_CHROME
  ? process.env.PLAYWRIGHT_CHROME === '1'
    ? LOCAL_CHROME
    : process.env.PLAYWRIGHT_CHROME
  : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // trace captures DOM snapshots + network per step, which covers failure
    // forensics without requiring ffmpeg (unsupported on some local macOS
    // versions) the way video recording would.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // The same suite runs in Chromium and WebKit (Safari): WebKit differs in
  // focus-on-click, CSP handling (upgrade-insecure-requests on localhost) and
  // CSS feature support, which is exactly what these runs are here to catch.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: executablePath ? { executablePath } : undefined },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // The API (server/index.ts) on its own port and database, so demo orders in
  // tests never touch a dev server's data; vite preview proxies /api to it.
  webServer: [
    {
      // a fresh database per run, so demo orders never deplete the stock
      command: 'rm -f data/e2e.db* && node server/index.ts',
      url: `http://127.0.0.1:${API_PORT}/api/stock`,
      env: { API_PORT: String(API_PORT), DB_PATH: 'data/e2e.db' },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      env: { API_PORT: String(API_PORT) },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
