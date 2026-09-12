import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' registra el nuevo Service Worker y recarga sin pedirle
      // confirmación al usuario en cada release; ideal para una PoC.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Planos 2D — Diseñador de Espacios',
        short_name: 'Planos 2D',
        description:
          'Diseña la distribución de espacios de tu vivienda por piso, en un lienzo 2D con snap-to-grid.',
        theme_color: '#0D1117',
        background_color: '#0D1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea el shell de la app para que el lienzo abra offline
        // una vez visitado por primera vez.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      devOptions: {
        // Permite probar el Service Worker en `npm run dev`.
        enabled: true,
      },
    }),
  ],
});
