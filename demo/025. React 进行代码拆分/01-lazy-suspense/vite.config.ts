import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 01-lazy-suspense 配置
// 本 demo 主要通过 React.lazy + Suspense 实现路由级拆分，
// 因此 build 配置保持「不强制 manualChunks」，让 lazy 自然产出独立 chunk。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5252,
    open: false,
  },
  build: {
    // 关闭 chunk 大小警告，方便观察拆分产物
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 给 lazy 产出的 chunk 一个清晰的前缀，便于在 dist/assets 中识别
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
