import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5272,
    open: false,
  },
  build: {
    // 启用 gzip 资源大小报告（仅展示用）
    chunkSizeWarningLimit: 1000,
  },
})
