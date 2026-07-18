import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案二：响应式图片（srcset / sizes / picture）
// 浏览器根据当前视口与 DPR 选择最合适尺寸的图片，避免在小屏幕上下载 4K 大图，
// 节省带宽并加快 LCP；<picture> 还可做艺术指导（art direction）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5247,
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
