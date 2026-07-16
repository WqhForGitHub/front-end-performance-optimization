import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案三：Nginx 服务端缓存配置演示
// 本项目配套 nginx.conf，演示如何在服务端配置各类缓存头
export default defineConfig({
  plugins: [react()],
  server: { port: 5227 },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
