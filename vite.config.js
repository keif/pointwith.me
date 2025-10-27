import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './build/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Uncomment this line when deploying to GitHub Pages:
  // base: '/pointwith.me/',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 400, // Set to 400KB (Firebase chunk is ~342KB)
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase into its own chunk (largest dependency)
          'firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/database',
          ],
          // React ecosystem
          'react-vendor': [
            'react',
            'react-dom',
            'react/jsx-runtime',
          ],
          // Router
          'router': [
            'react-router-dom',
          ],
          // UI libraries
          'ui-libs': [
            'react-hot-toast',
            'lucide-react',
          ],
          // Utilities
          'utils': [
            'date-fns',
            'uuid',
            'shortid',
            'store',
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
