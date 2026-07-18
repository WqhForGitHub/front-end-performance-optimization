import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 方案三：构建产物优化
 *
 * 1. manualChunks：把稳定的第三方依赖拆为独立 chunk，便于长期缓存
 * 2. external + CDN externals：把 react / react-dom 通过 CDN 引入，进一步减小自有产物体积
 * 3. tree shaking：依赖 ESM 静态分析，配合 package.json 的 sideEffects: false
 *
 * 本文件展示了「完整启用」的配置；如果要在本地真实构建验证，需要：
 *   - 在 index.html 引入 react / react-dom 的 CDN script
 *   - 移除下面 external 中的注释（默认注释掉以让 dev 模式可运行）
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5245,
    host: true,
  },
  build: {
    // 关闭 sourcemap 以减小产物体积（生产环境）
    sourcemap: false,
    // 默认 esbuild minify，已开启 tree shaking
    minify: 'esbuild',
    // 目标浏览器，影响 polyfill
    target: 'es2020',
    // 单个 chunk 大小告警阈值（KB）
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      // CDN externals：把 react / react-dom 完全排除出产物，由 CDN script 提供
      // 真实启用时需要 index.html 引入 CDN，这里默认注释避免 dev 报错
      // external: ['react', 'react-dom'],
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // manualChunks：按依赖维度手动拆分
        manualChunks(id: string): string | undefined {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('lodash')) {
              return 'vendor-lodash'
            }
            if (id.includes('chart') || id.includes('d3')) {
              return 'vendor-chart'
            }
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
