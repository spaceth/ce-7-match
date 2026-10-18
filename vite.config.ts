import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copy } from './src/content/index.ts'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function siteMeta(): Plugin {
  const fields: Record<string, string> = {
    '%LANG%': copy.meta.lang,
    '%TITLE%': escapeHtml(copy.meta.title),
    '%DESCRIPTION%': escapeHtml(copy.meta.description),
    '%SITE_NAME%': escapeHtml(copy.meta.siteName),
    '%URL%': escapeHtml(copy.meta.url),
    '%IMAGE%': escapeHtml(copy.meta.image),
    '%IMAGE_TYPE%': escapeHtml(copy.meta.imageType),
    '%IMAGE_WIDTH%': escapeHtml(copy.meta.imageWidth),
    '%IMAGE_HEIGHT%': escapeHtml(copy.meta.imageHeight),
    '%NOSCRIPT%': escapeHtml(copy.meta.noscript),
  }
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      return Object.entries(fields).reduce((next, [token, value]) => next.replaceAll(token, value), html)
    },
  }
}

function publishOgImage(): Plugin {
  return {
    name: 'publish-og-image',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'og.jpg',
        source: readFileSync(resolve('og.jpg')),
      })
    },
  }
}

function preloadModel(): Plugin {
  return {
    name: 'preload-model',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        const asset = Object.values(ctx.bundle).find(
          (item) => item.type === 'asset' && item.fileName.endsWith('.glb'),
        )
        if (!asset || asset.type !== 'asset') return html
        const tag = `    <link rel="preload" href="/${asset.fileName}" as="fetch" crossorigin="anonymous" />`
        return html.replace('</head>', `${tag}\n  </head>`)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), siteMeta(), publishOgImage(), preloadModel()],
  assetsInclude: ['**/*.glb'],
  server: {
    port: 5173,
    strictPort: false,
  },
})
