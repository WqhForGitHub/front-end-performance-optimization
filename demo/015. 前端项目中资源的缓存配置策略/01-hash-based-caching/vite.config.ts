import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案一：基于内容哈希的缓存策略
// 通过在文件名中注入内容哈希（content hash），实现：
// 1. 文件内容变化 -> 哈希变化 -> 文件名变化 -> 浏览器重新请求
// 2. 文件内容不变 -> 哈希不变 -> 文件名不变 -> 命中浏览器缓存
// 这样可以配合长期的 immutable 缓存策略，最大化缓存命中率
export default defineConfig({
  plugins: [react()],
  server: { port: 5225 },
  build: {
    rollupOptions: {
      output: {
        // 入口文件使用 [hash] 占位符，hash 基于整个 chunk 内容计算
        entryFileNames: 'assets/[name].[hash].js',
        // 异步 chunk 使用同样的 hash 命名
        chunkFileNames: 'assets/[name].[hash].js',
        // 静态资源（css/图片/字体）使用 [ext] 保留原始扩展名
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
