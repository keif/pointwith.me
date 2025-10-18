import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Uncomment this line when deploying to GitHub Pages:
  // base: '/pointwith.me/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Add aliases if needed, e.g.:
      // '@': '/src',
    },
  },
});
