import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 03-import-dynamic 配置
// 本 demo 通过原生动态 import() 实现按需加载。
// Vite 会自动把每个动态 import() 的模块（及其依赖）拆成独立 chunk，无需额外配置。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5254,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 让动态 import 产出的 chunk 名称更可读
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
