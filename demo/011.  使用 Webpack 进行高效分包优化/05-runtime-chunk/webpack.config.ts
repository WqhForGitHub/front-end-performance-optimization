/**
 * 运行时分离配置
 *
 * 原理：Webpack 在每个 bundle 中会注入运行时代码（模块加载、解析逻辑、
 * chunk 映射表等）。通过 optimization.runtimeChunk 将运行时代码分离到
 * 独立的 chunk，避免业务代码变更导致运行时代码变化，从而影响其他 chunk 的缓存。
 *
 * 优势：
 * 1. 运行时代码单独缓存，不受业务代码变更影响
 * 2. 配合 splitChunks 实现最优的缓存策略
 * 3. contenthash 更稳定，提升浏览器缓存命中率
 *
 * 核心配置：
 * - optimization.runtimeChunk: 'single' 将所有入口的运行时代码合并到一个 chunk
 * - splitChunks.cacheGroups.vendors: 同时分离第三方依赖
 *
 * 构建后产出：
 * - runtime.[hash].js：Webpack 运行时代码（模块加载逻辑）
 * - vendors.[hash].js：第三方依赖
 * - main.[hash].js：业务代码
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
  optimization: {
    // 将运行时代码分离到单独的 chunk
    // 'single' 表示所有入口共享一个运行时 chunk
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: '运行时分离'
    })
  ]
}

export default config
