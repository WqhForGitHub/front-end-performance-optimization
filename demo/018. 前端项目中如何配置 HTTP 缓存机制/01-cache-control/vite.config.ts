import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 本演示通过 preview 阶段为不同类型的资源设置不同的 Cache-Control 响应头，
// 让开发者可以直观地在浏览器 DevTools 的 Network 面板里观察到缓存行为。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5234,
    open: true,
    // 开发阶段 Vite 默认对源码不开启强缓存，便于热更新
    headers: {
      'Cache-Control': 'no-cache'
    }
  },
  preview: {
    port: 5234,
    // 预览阶段模拟真实静态资源服务器的缓存策略
    headers: {
      // HTML 文档：始终协商缓存，保证用户拿到最新入口
      'Cache-Control': 'no-cache'
    }
  },
  build: {
    // 产物文件名带 hash，配合长缓存策略
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
