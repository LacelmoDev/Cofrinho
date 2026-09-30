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
        start_url: '/',
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
        navigateFallbackDenylist: [/^\/(privacidade|termos|armazenamento)\.html$/]
      }
    })
  ]
})
