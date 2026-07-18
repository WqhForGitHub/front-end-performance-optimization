import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

/**
 * Vue3 + Vite 解决 vendor 文件过大问题的优化配置
 *
 * 1. manualChunks：把 vue 单独分包，第三方库按组分包
 * 2. externals：把大库走 CDN（生产环境）
 * 3. compression：Gzip/Brotli 压缩
 * 4. chunkSizeWarningLimit：警告阈值
 */
export default defineConfig({
  plugins: [
    vue(),
    // Gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli 压缩（更高效）
    viteCompression({
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  server: { port: 5308 },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 关键：把第三方库分包，避免单个 vendor 文件过大
        manualChunks: {
          // Vue 核心单独分包
          vue: ['vue'],
          // 其他第三方库按需分组
          // 例如：echarts: ['echarts'], lodash: ['lodash-es']
        },
      },
    },
  },
})
