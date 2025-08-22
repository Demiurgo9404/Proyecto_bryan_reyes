import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  server: {
    port: 3000, // Cambiado a 3000 para consistencia
    strictPort: true,
    open: true,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws',
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    // Allow serving files from the public directory
    fs: {
      strict: false
    }
  },
  // Base URL for production builds
  base: '/',
  // Configure build output
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Enable source maps in development
    sourcemap: process.env.NODE_ENV !== 'production',
    // Minify for production
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    // Configure rollup options
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['framer-motion', '@emotion/react', '@emotion/styled']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
