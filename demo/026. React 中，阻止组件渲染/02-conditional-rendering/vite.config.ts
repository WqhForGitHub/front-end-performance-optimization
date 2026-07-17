import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 02-conditional-rendering 配置
// 本 demo 演示父组件侧的条件渲染模式：&& / 三目 / IIFE / switch / enum map
// 以及常见陷阱（如 count && <Comp/> 当 count 为 0 时渲染出 "0"）。
// 端口 5256。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5256,
    open: false,
  },
})
