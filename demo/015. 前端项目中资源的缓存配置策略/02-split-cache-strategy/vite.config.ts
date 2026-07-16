import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 方案二：分级缓存策略（Split Cache Strategy）
// 针对不同类型的资源，配置不同的缓存规则：
// - HTML 入口：no-cache（每次协商验证，确保拿到最新 hash 引用）
// - JS/CSS（带 hash）：max-age=31536000, immutable（长期强缓存）
// - 图片/字体/媒体：max-age=2592000（中等时长缓存，30 天）
// - 第三方依赖：单独拆分 chunk，独立缓存
export default defineConfig({
  plugins: [react()],
  server: { port: 5226 },
  build: {
    // 资源分类输出，便于 Nginx 按 location 精细化配置缓存规则
    rollupOptions: {
      output: {
        // 入口文件
        entryFileNames: 'assets/js/[name].[hash].js',
        // 异步 chunk
        chunkFileNames: 'assets/js/[name].[hash].js',
        // 静态资源按类型分目录，便于配置不同缓存策略
        assetFileNames: (assetInfo: { name?: string }) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) {
            return 'assets/css/[name].[hash].[ext]'
          }
          if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(name)) {
            return 'assets/images/[name].[hash].[ext]'
          }
          if (/\.(woff2?|ttf|eot|otf)$/.test(name)) {
            return 'assets/fonts/[name].[hash].[ext]'
          }
          return 'assets/misc/[name].[hash].[ext]'
        },
        // 手动分包：第三方依赖单独打包，业务代码变化不影响依赖缓存
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // 生成 manifest，便于服务端映射 hash 文件名
    manifest: true,
  },
})
