import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
    proxy: {
      '/sc-api': {
        target: 'https://api-v2.soundcloud.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sc-api/, ''),
        headers: {
          'Origin': 'https://soundcloud.com',
          'Referer': 'https://soundcloud.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
  },
  // @ts-ignore
  test: {
    globals: true,
  },
});
