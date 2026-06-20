import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Replit: frontend on 5000, backend on 3001. Local: frontend on 3000, backend on 5000.
const isReplit = !!process.env.REPL_ID;
const frontendPort = isReplit ? 5000 : 3000;
const backendUrl = isReplit ? 'http://localhost:3001' : 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    strictPort: isReplit,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
