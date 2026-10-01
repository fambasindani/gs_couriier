import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || ''

  return {
    // L'application est servi à la racine /courrier/ (ex: totalconceptrdc.org/courrier/).
    base: '/courrier/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5174,
      host: true,
      // En dev : on proxy /api vers le backend (évite le blocage CORS du navigateur).
      // VITE_API_URL vide → le client utilise des URL relatives /api → proxy.
      ...(proxyTarget
        ? {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              },
            },
          }
        : {}),
    },
  }
})