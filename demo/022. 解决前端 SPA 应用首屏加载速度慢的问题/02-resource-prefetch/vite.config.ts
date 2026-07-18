import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案二：资源预取 / 预连接
// 在 index.html 中通过 <link rel="dns-prefetch"> / <link rel="preconnect">
// 提前与 API 域名完成 DNS/TCP/TLS 握手；运行时通过 usePrefetch hook
// 在 idle / hover 时机动态插入 <link rel="prefetch"> 预取下一路由的 chunk。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5244,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
