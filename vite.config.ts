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
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
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
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'pwa-512x512.png', // add desktop sreenshot
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'My App',
          },
          {
            src: 'pwa-512x512.png', // add mobile screenshot
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'My App',
          },
        ],
      },
    }),
  ],
});
