import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The React app lives in client/. In development, Vite serves it and forwards
// /api calls to the Express server, so both run with one command (npm run dev).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  const sitePort = env.SITE_PORT || 3000;
  return {
    root: 'client',
    plugins: [react()],
    server: {
      port: Number(env.CLIENT_DEV_PORT || 5173),
      proxy: { '/api': `http://localhost:${sitePort}` },
    },
    build: { outDir: '../dist', emptyOutDir: true },
  };
});
