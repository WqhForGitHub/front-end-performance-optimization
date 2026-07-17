import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 02-manual-chunks 配置
// 通过 rollupOptions.output.manualChunks 把依赖按「稳定性 + 用途」拆分成多个 vendor chunk。
// 这是构建期静态拆分：不改变代码加载时机，只改变 chunk 划分边界，主要目的是：
//   1. 提高缓存命中率（稳定的 vendor 不随业务代码变化）
//   2. 并行下载（多个小 chunk 可在 HTTP/2 下并发请求）
//   3. 控制单 chunk 体积，便于浏览器解析
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5253,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 方式一：对象形式 —— 简单直接，适合依赖分组明确的场景
        // manualChunks: {
        //   'react-vendor': ['react', 'react-dom'],
        //   'utils-vendor': ['lodash-es', 'dayjs'],
        // },

        // 方式二：函数形式 —— 更灵活，可按 id 动态归类
        manualChunks(id: string) {
          // id 是模块的绝对路径或虚拟模块标识
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor' // react / react-dom / scheduler
            }
            if (id.includes('lodash')) {
              return 'utils-vendor' // 工具库
            }
            if (id.includes('dayjs')) {
              return 'date-vendor' // 日期库
            }
            return 'vendor' // 其余第三方依赖
          }
          // 业务代码默认留在各自 chunk，不在此 return
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
