import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案一：图片懒加载（IntersectionObserver + 原生 loading="lazy"）
// 通过延迟加载视口外的图片，避免一次性请求几十张图片导致带宽争抢，
// 显著降低首屏 LCP 与可见图片的加载时间。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5246,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    reportCompressedSize: true
  }
})
