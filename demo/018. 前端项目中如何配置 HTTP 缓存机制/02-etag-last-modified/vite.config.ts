import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 本演示聚焦“协商缓存”阶段：ETag 与 Last-Modified。
// 预览阶段为带 hash 的静态产物设置 ETag 与 Last-Modified，HTML 文档使用 no-cache 触发每次协商。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5235,
    open: true,
    headers: {
      // 开发期每次都协商，便于观察 304
      'Cache-Control': 'no-cache'
    }
  },
  preview: {
    port: 5235,
    headers: {
      // HTML 入口：no-cache，每次发协商请求
      'Cache-Control': 'no-cache',
      // Vite preview 内置静态服务默认会附带 ETag 与 Last-Modified
      'ETag': 'W/"demo-etag-v1"'
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
