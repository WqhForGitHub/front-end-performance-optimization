import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 01-return-null 配置
// 本 demo 演示组件内部使用 `return null` 阻止渲染。
// 端口 5255。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5255,
    open: false,
  },
})
