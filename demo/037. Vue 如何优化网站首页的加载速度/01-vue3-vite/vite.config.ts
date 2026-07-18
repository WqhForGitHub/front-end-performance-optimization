import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 5305 },
  build: {
    // 1. 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
        },
      },
    },
    // 2. CSS 代码分割
    cssCodeSplit: true,
    // 3. 资源内联阈值（小于 4kb 的资源内联为 base64）
    assetsInlineLimit: 4096,
    // 4. 启用 brotli 压缩（生产环境）
    chunkSizeWarningLimit: 1000,
  },
})
