import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'Money.png'],
      manifest: {
        name: 'Rowlr — Personal Finance Manager',
        short_name: 'Rowlr',
        description: 'Track your expenses, income, bills, loans and savings',
        theme_color: '#1a1a1a',
        background_color: '#f8f8f6',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'Money.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Money.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
})