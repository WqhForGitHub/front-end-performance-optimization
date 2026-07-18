import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 本演示的真正缓存逻辑由同目录 nginx.conf 提供（生产部署用）。
// Vite 这里仅负责本地开发与构建产物；build 产物会放到 dist/，可由 nginx 指向。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5236,
    open: true,
  },
  preview: {
    port: 5236,
    // 仅作演示用，真实环境以 nginx.conf 为准
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  build: {
    outDir: 'dist',
    // 产物文件名带 contenthash，配合 nginx 中的长缓存规则
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
