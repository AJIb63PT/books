import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/sms-pilot': {
          target: 'https://smspilot.ru',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/sms-pilot/, ''),
        },
      },
    },
  }
})