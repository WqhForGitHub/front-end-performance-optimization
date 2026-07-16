import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 方案一：Vite + Terser 代码压缩
 *
 * 关键配置点：
 * 1. build.minify: 'terser' —— 显式使用 Terser 进行压缩（Vite 5 默认是 esbuild，
 *    改成 'terser' 可获得更激进、更细粒度的压缩控制，如 drop_console / drop_debugger）。
 * 2. build.terserOptions —— 透传给 Terser 的参数：
 *    - compress.drop_console = true   : 移除所有 console.*
 *    - compress.drop_debugger = true  : 移除 debugger 语句
 *    - compress.pure_funcs             : 标记为“无副作用”的函数，调用处可被安全删除
 *    - format.comments = false         : 移除注释
 *    - mangle                          : 变量名混淆（toplevel 顶层变量也混淆）
 * 3. build.rollupOptions.output —— 额外的产出控制：
 *    - manualChunks                    : 把 react / react-dom 拆到单独 chunk
 *    - chunkFileNames / entryFileNames : 输出文件名带 hash，便于长缓存
 * 4. build.cssCodeSplit / assetsInlineLimit —— 控制 CSS 拆分与资源内联阈值
 *
 * 注意：要使用 'terser' 必须安装 `terser` 包（Vite 5 已不再默认包含）：
 *   npm i -D terser
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5231,
  },
  build: {
    // 1. 指定压缩器为 Terser（默认是 'esbuild'）
    minify: 'terser',
    // 2. 透传给 Terser 的选项
    terserOptions: {
      // 压缩选项
      compress: {
        // 移除所有 console.* 调用（生产环境非常有用，避免泄露调试信息）
        drop_console: true,
        // 移除 debugger 语句
        drop_debugger: true,
        // 标记为纯函数：可安全删除调用处
        // 例如：pure_funcs: ['myDebugLog']
        pure_funcs: ['__PURE__'],
        // 移除未使用的函数 / 变量
        unused: true,
        // 拥抱死代码消除（dead code elimination）
        dead_code: true,
        // 内联常量与简单函数
        inline: 1,
        // 优化条件表达式
        sequences: true,
        // 合并变量声明
        join_vars: true,
        // 计算常量表达式
        evaluate: true,
      },
      // 格式化选项
      format: {
        // 移除所有注释
        comments: false,
        // 美化（仅调试用，生产请保持 false）
        beautify: false,
      },
      // 名称混淆
      mangle: {
        // 顶层变量也混淆（如模块导出变量）
        toplevel: true,
        // 保留 eval 作用域不被混淆
        eval: false,
        // 不希望被混淆的标识符（如对外 API）
        reserved: [],
      },
      // 不输出 sourcemap（生产环境）
      sourceMap: false,
    },
    // 关闭生成 sourcemap，进一步减小体积
    sourcemap: false,
    // chunk 大小警告阈值（KB），调整以适应实际项目
    chunkSizeWarningLimit: 1000,
    // CSS 代码分割
    cssCodeSplit: true,
    // 资源内联阈值（< 4KB 的资源内联为 base64）
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // 入口文件名带 hash
        entryFileNames: 'assets/[name].[hash].js',
        // chunk 文件名带 hash
        chunkFileNames: 'assets/[name].[hash].js',
        // 静态资源文件名带 hash
        assetFileNames: 'assets/[name].[hash].[ext]',
        // 手动拆包：把 vendor 拆出来，便于长缓存
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
