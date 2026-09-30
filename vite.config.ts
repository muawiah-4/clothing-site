import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { DEV_HEADERS, META_CSP, PREVIEW_HEADERS, PROD_CSP } from './security-headers.ts'

/**
 * Build-only: inject the baseline CSP <meta> into index.html (it can't live in
 * the source file — `vite dev` needs inline scripts/styles that the production
 * policy forbids), and fail the build if the static host configs have drifted
 * from the policy in security-headers.ts.
 */
function securityHeaders(): Plugin {
  const root = import.meta.dirname
  return {
    name: 'atelier:security-headers',
    apply: 'build',
    buildStart() {
      const headersFile = readFileSync(path.join(root, 'public/_headers'), 'utf8')
      const netlifyCsp = headersFile.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1]?.trim()
      const vercel = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8')) as {
        headers: { headers: { key: string; value: string }[] }[]
      }
      const vercelCsp = vercel.headers
        .flatMap((h) => h.headers)
        .find((h) => h.key === 'Content-Security-Policy')?.value
      for (const [file, csp] of [['public/_headers', netlifyCsp], ['vercel.json', vercelCsp]]) {
        if (csp !== PROD_CSP) {
          this.error(`${file} Content-Security-Policy is out of sync with security-headers.ts.\nExpected: ${PROD_CSP}\nFound:    ${csp}`)
        }
      }
    },
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${META_CSP}" />`
      if (!html.includes('<meta charset="UTF-8" />')) {
        throw new Error('index.html: expected <meta charset="UTF-8" /> to anchor the CSP meta tag')
      }
      return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${meta}`)
    },
  }
}

/**
 * Build-only: preload the display font (Fraunces, latin subset) so the hero
 * headline doesn't wait for the CSS to be parsed before the font is fetched.
 * The file name is content-hashed, so it's looked up in the output bundle.
 */
function preloadDisplayFont(): Plugin {
  const FONT = /fraunces-latin-opsz-normal-[\w-]+\.woff2$/
  return {
    name: 'atelier:preload-display-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((name) => FONT.test(name))
        if (!file) throw new Error('preloadDisplayFont: Fraunces latin woff2 not found in the bundle')
        return [
          {
            tag: 'link',
            attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head',
          },
        ]
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), securityHeaders(), preloadDisplayFont()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    headers: DEV_HEADERS,
  },
  preview: {
    headers: PREVIEW_HEADERS,
  },
})
