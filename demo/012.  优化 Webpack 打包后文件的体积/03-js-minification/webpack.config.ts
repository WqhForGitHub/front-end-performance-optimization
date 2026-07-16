/**
 * JS 压缩优化 - webpack 配置
 *
 * 优化点：
 * 使用 terser-webpack-plugin 进行激进的 JS 代码压缩：
 * 1. 移除注释（comments: false）
 * 2. 移除 console.log（drop_console: true）
 * 3. 移除 debugger 语句（drop_debugger: true）
 * 4. 混淆局部变量名（toplevel: true）
 * 5. 多次压缩以获得更小体积（passes: 3）
 * 6. 使用多进程并行压缩（parallel: true）
 *
 * 通过 --no-minify 参数可关闭压缩，用于对比打包体积差异
 */
import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

/**
 * 导出函数形式的配置，便于根据 argv 参数动态切换配置
 * @param _env 环境变量（未使用）
 * @param argv 命令行参数，包含 mode、自定义参数等
 * @returns webpack 配置对象
 */
const config = (_env: unknown, argv: Record<string, unknown>): Configuration => {
  // 判断是否通过 --no-minify 关闭压缩
  const noMinify = argv['no-minify'] === true

  return {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: noMinify ? 'bundle.no-minify.js' : 'bundle.js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
    optimization: {
      // 当 noMinify 为 true 时关闭压缩
      minimize: !noMinify,
      minimizer: [
        new TerserPlugin({
          // 多进程并行压缩
          parallel: true,
          // 不提取 LICENSE 注释到单独文件
          extractComments: false,
          terserOptions: {
            // 压缩选项
            compress: {
              // 移除 console.log
              drop_console: true,
              // 移除 debugger 语句
              drop_debugger: true,
              // 纯函数标记，帮助 terser 更激进地移除未使用代码
              pure_funcs: ['console.log', 'console.info', 'console.debug'],
              // 多次压缩以获得更小体积
              passes: 3,
              // 移除未使用的函数
              unused: true,
              // 折叠常量表达式
              collapse_vars: true,
              // 内联函数
              inline: 2,
            },
            // 混淆选项
            mangle: {
              // 顶级变量混淆
              toplevel: true,
              // 混淆属性名（谨慎使用，可能影响属性访问）
              // properties: true,
            },
            // 格式选项
            format: {
              // 移除所有注释
              comments: false,
            },
          },
        }),
      ],
    },
    devtool: noMinify ? 'source-map' : false,
  }
}

export default config
