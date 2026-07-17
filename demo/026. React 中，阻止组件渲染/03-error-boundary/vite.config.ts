import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 03-error-boundary 配置
// 本 demo 演示用类组件实现错误边界（Error Boundary），
// 在子组件抛错时阻止崩溃渲染，转而展示 fallback UI。
// 端口 5257。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5257,
    open: false,
  },
})
