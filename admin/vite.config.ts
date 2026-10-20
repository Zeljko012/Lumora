import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  // gradi se direktno u public/admin sajta — Astro ga posle kopira u /admin/
  build: { chunkSizeWarningLimit: 900, outDir: '../public/admin', emptyOutDir: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Lumora Admin',
        short_name: 'Lumora',
        description: 'Upravljanje porudžbinama, pošiljkama i analitikom prodavnice Lumora',
        lang: 'sr-Latn',
        theme_color: '#4f6f63',
        background_color: '#f6f3ee',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,ttf}'],
        runtimeCaching: [
          {
            // slike proizvoda sa sajta (i starog Shopify-ja) — čuvaju se za offline rad
            urlPattern: /\/images\/products\/.*|^https:\/\/cdn\.shopify\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'slike-proizvoda',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
