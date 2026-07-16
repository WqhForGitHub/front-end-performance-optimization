/**
 * resolve 解析优化配置示例
 *
 * 原理：Webpack 解析每个 import / require 时，都会按 resolve 规则去文件系统
 * 中查找模块。解析过程涉及大量目录扫描与文件尝试，是构建耗时的隐藏大头。
 * 通过精简解析规则可以显著减少磁盘 IO 与判断次数。
 *
 * 三大优化点：
 * 1. resolve.alias：把深层路径映射成短别名，避免长路径逐级解析。
 * 2. resolve.extensions：尽量缩短后缀列表。默认包含 ['.js', '.json', '.wasm']，
 *    每多一个后缀，每个未带后缀的 import 都要多尝试一次文件存在性判断。
 *    保留项目实际使用的后缀即可（这里仅 .ts / .js）。
 * 3. resolve.modules：指定模块查找目录，避免遍历所有上级 node_modules。
 *    显式声明 src 与 node_modules 即可。
 *
 * 此外 resolve.mainFiles 控制目录入口文件名（默认 index），如非必要不要扩充。
 */
import path from 'path'
import type { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve: {
    // ===== 优化点 1：别名，缩短解析路径 =====
    alias: {
      // 把深层 utils 目录映射为 @utils，业务代码可直接 import '@utils/helper'
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@src': path.resolve(__dirname, 'src')
    },
    // ===== 优化点 2：精简后缀列表 =====
    // 只保留实际用到的后缀，减少每个 import 的尝试次数
    extensions: ['.ts', '.js'],
    // ===== 优化点 3：限定模块查找目录 =====
    // 显式声明，避免向上逐级遍历 node_modules
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    // 目录入口文件名保持最小集合
    mainFiles: ['index']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'resolve 解析优化 - 优化打包速度'
    })
  ]
}

export default config
