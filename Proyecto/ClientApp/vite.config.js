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
    port: 3000,
    strictPort: true,
    open: true,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      port: 3000
    },
    // Configuración de proxy si es necesario
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../wwwroot',
    emptyOutDir: true,
    sourcemap: true
  }
});
