import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案一：路由级懒加载
// Vite 默认会对 dynamic import() 做代码分割（code splitting），
// 因此 React.lazy 包裹的路由组件会被拆分为独立的 chunk。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5243,
    host: true,
  },
  build: {
    // 让 chunk 文件名带内容 hash，便于长期缓存
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // 产物报告，方便观察 chunk 数量与体积
    reportCompressedSize: true,
  },
})
