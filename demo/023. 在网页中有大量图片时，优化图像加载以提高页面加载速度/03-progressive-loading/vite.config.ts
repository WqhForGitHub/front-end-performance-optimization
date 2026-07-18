import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案三：渐进式图片加载（LQIP + blur-up）
// 先加载一张极小的低质量占位图（LQIP）并模糊显示，主图加载完成后平滑淡入，
// 给用户即时反馈，避免长时间白屏，提升感知性能与 LCP 体验。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5248,
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
    reportCompressedSize: true,
  },
})
