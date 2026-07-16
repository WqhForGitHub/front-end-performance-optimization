/**
 * 持久化缓存（Persistent Cache）配置示例
 *
 * 原理：Webpack 5 内置了文件系统级别的持久化缓存（cache.type = 'filesystem'）。
 * 首次构建时，Webpack 会把模块解析、转换后的中间产物写入 node_modules/.cache/webpack
 * 目录；再次构建时直接读取缓存，跳过大量重复的 loader 转译与依赖解析工作，
 * 从而显著提升二次构建速度（通常可提速 50%~90%）。
 *
 * 关键配置：
 * - cache.type: 'filesystem' 开启文件系统持久化缓存
 * - cache.buildDependencies.config: 把当前配置文件本身作为缓存依赖，
 *   一旦配置文件变化，缓存自动失效，避免使用过期缓存。
 * - cache.version: 可选，通过自定义字符串控制缓存版本，强制失效。
 *
 * 验证方式：
 * 1. 第一次执行 `npm run build`，观察构建耗时（冷启动）。
 * 2. 第二次执行 `npm run build`，观察构建耗时（命中缓存，明显变快）。
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
    extensions: ['.ts', '.js']
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
  // ===== 核心：持久化缓存 =====
  cache: {
    // 使用文件系统缓存，构建结果会落盘到 node_modules/.cache/webpack
    type: 'filesystem',
    // 把本配置文件加入缓存依赖：配置一旦改动，缓存自动失效
    buildDependencies: {
      config: [__filename]
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: '持久化缓存 - 优化打包速度'
    })
  ]
}

export default config
