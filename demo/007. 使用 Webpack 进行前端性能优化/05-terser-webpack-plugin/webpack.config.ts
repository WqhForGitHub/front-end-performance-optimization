import { Configuration } from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * terser-webpack-plugin 演示
 *
 * 原理：terser-webpack-plugin 使用 terser 对 JS 进行压缩混淆，
 * 移除注释、空白，缩短变量名，并可删除 console / debugger 等代码，
 * 从而显著减小产物体积。
 *
 * 说明：webpack 5 在 production 模式下默认使用 terser 压缩，
 * 这里显式配置以演示可调参数（并行、删除 console、保留类名等）。
 *
 * 对比：把 mode 改为 development 或去掉 minimizer 配置，
 * 可以看到产物体积明显变大。
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // 使用多进程并行压缩
        parallel: 4,
        terserOptions: {
          compress: {
            // 生产环境移除 console 和 debugger
            drop_console: true,
            drop_debugger: true,
            // 纯函数优化
            pure_funcs: ['console.log'],
          },
          format: {
            // 移除所有注释
            comments: false,
          },
          mangle: {
            // 保留类名，便于调试
            keep_classnames: true,
          },
        },
        // 仅提取带 LICENSE 的注释（这里全部移除）
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
}

export default config
