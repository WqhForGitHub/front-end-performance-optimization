import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5242,
  },
  build: {
    // 预渲染概念示意：实际项目中通过 vite-plugin-prerender / vite-plugin-ssr /
    // vite-react-ssr 等插件在构建期生成静态 HTML
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
