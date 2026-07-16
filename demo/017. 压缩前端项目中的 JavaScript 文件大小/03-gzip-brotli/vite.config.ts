import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

/**
 * 方案三：Vite + gzip / brotli 压缩
 *
 * 关键配置点：
 *
 * 1. 使用 vite-plugin-compression 在 build 阶段生成预压缩文件：
 *    - 一份 .gz  (gzip)
 *    - 一份 .br  (brotli)
 *    原始文件保留不变，由 Nginx / 静态服务器根据 Accept-Encoding 协商返回。
 *
 * 2. gzip 与 brotli 的对比：
 *    - gzip   : 基于 DEFLATE，兼容性最好（所有现代浏览器都支持），压缩率约 70%
 *    - brotli : Google 推出，针对 Web 文本优化，压缩率比 gzip 高 15%~25%，
 *               但只支持 HTTPS（现代浏览器在 https 下才接受 br 编码）
 *
 * 3. 为什么使用“预压缩”而不是“运行时压缩”？
 *    - 预压缩：构建时一次性生成 .gz / .br，运行时直接返回静态文件，CPU 占用低
 *    - 运行时压缩：每次请求都实时压缩，CPU 占用高，对大文件不友好
 *
 * 4. 关键配置：
 *    - threshold            : 仅压缩大于该阈值的文件（字节，默认 10KB）
 *    - algorithm            : 'gzip' / 'brotliCompress'
 *    - ext                  : 输出扩展名（.gz / .br）
 *    - deleteOriginFile     : false 保留原始文件（推荐）
 *    - compressionOptions   : 压缩等级（gzip 9 / brotli 11 为最高）
 *
 * 5. 服务器侧配置（Nginx 示例）：
 *      gzip_static on;
 *      brotli_static on;
 *    让 Nginx 优先返回预压缩文件，而不是实时压缩。
 *
 * 注意：vite-plugin-compression 同时支持 gzip 和 brotli，需要在 plugins
 * 数组中分别调用两次（algorithm 不同）。
 */
export default defineConfig({
  plugins: [
    react(),

    // 1. 生成 .gz 文件（gzip 压缩）
    viteCompression({
      verbose: true,
      // 仅压缩大于 10KB 的文件
      threshold: 10240,
      // 压缩算法
      algorithm: 'gzip',
      // 输出扩展名
      ext: '.gz',
      // 不删除原始文件
      deleteOriginFile: false,
      // gzip 压缩等级（1-9，9 最高）
      compressionOptions: {
        level: 9,
      },
    }),

    // 2. 生成 .br 文件（brotli 压缩）
    // 注意：brotli 压缩比 gzip 慢，但压缩率更高
    viteCompression({
      verbose: true,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
      compressionOptions: {
        // brotli 压缩等级（0-11，11 最高）
        params: {
          [Symbol.for('brotli')]: {
            quality: 11,
          },
        },
      },
    }),
  ],
  server: {
    port: 5233,
  },
  build: {
    // 先用 Terser/esbuild 压缩 JS，再让 compression 插件生成 .gz / .br
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
