import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'Fun Golf',
        short_name: 'Fun Golf',
        description: 'Fun Golf',
        theme_color: '#1a2e10',
        background_color: '#1a2e10',
        display: 'fullscreen',
        icons: [
          {
            src: 'pwa-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'fun_golf_splash.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Fun Golf',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Fun Golf',
          },
        ],
      },
    }),
  ],
});
