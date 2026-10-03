import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Data/hora do build: aparece em Definições para saberes que versão está a correr
  define: { __BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC') },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Cofrinho AO',
        short_name: 'Cofrinho AO',
        description: 'Controlo de gastos, receitas e metas de poupança em Kwanzas.',
        lang: 'pt-AO',
        display: 'standalone',
        orientation: 'any',
        id: '/',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity'],
        screenshots: [
          { src: 'screenshots/narrow-1-inicio.jpg', sizes: '780x1688', type: 'image/jpeg', form_factor: 'narrow', label: 'Saldo, entradas e saídas em Kwanzas' },
          { src: 'screenshots/narrow-2-grafico.jpg', sizes: '780x1688', type: 'image/jpeg', form_factor: 'narrow', label: 'Gastos por categoria' },
          { src: 'screenshots/narrow-3-metas.jpg', sizes: '780x1688', type: 'image/jpeg', form_factor: 'narrow', label: 'Metas de poupança' },
          { src: 'screenshots/wide-1-inicio.jpg', sizes: '1280x720', type: 'image/jpeg', form_factor: 'wide', label: 'Cofrinho AO no computador' }
        ],
        theme_color: '#EC5C82',
        background_color: '#FFFCF7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Páginas legais são ficheiros próprios (não a app): não devem cair no index.html
        navigateFallbackDenylist: [/^\/(privacidade|termos|armazenamento)\.html$/, /^\/\.well-known\//],
        // As capturas do manifesto não precisam de ficar em cache offline
        globIgnores: ['screenshots/**']
      }
    })
  ]
})
