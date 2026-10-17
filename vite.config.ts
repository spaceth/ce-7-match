import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react(), preloadModel()],
  assetsInclude: ['**/*.glb'],
  server: {
    port: 5173,
    strictPort: false,
  },
})
