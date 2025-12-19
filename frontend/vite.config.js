import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
<<<<<<< HEAD
        name: 'Transporte UIDE',
        short_name: 'Bus UIDE',
        description: 'Registro de uso de transporte universitario',
        theme_color: '#242424',
=======
        name: 'UIDE Link',
        short_name: 'UIDE Link',
        description: 'Sistema de Transporte UIDE',
        theme_color: '#D32F2F',
        background_color: '#ffffff',
        display: 'standalone',
>>>>>>> 5f1505b (feat: Estructura unificada y limpia del sistema UIDE-Link)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
<<<<<<< HEAD
      devOptions: {
        enabled: true // Important to test in dev mode
=======
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/192\.168\.100\.34:8000\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 3
            }
          }
        ]
      },
      devOptions: {
        enabled: true
>>>>>>> 5f1505b (feat: Estructura unificada y limpia del sistema UIDE-Link)
      }
    })
  ],
})
