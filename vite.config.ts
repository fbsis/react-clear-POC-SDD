import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const basePath = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      '@domains': '/src/domains',
      '@application': '/src/application',
      '@infrastructure': '/src/infrastructure',
      '@presentation': '/src/presentation',
      '@app': '/src/app'
    }
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 250,
    assetsInlineLimit: 4096
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
});
