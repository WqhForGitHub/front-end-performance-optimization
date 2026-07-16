/**
 * 第三方依赖分离配置
 *
 * 原理：通过 optimization.splitChunks.cacheGroups.vendors 将 node_modules
 * 中的第三方库（如 lodash）单独打包成 vendor chunk，与应用业务代码分离。
 *
 * 优势：
 * 1. 第三方库变更频率低，可长期缓存（浏览器缓存命中率高）
 * 2. 业务代码变更不会导致 vendor chunk 的 contenthash 变化，缓存不失效
 * 3. 浏览器可并行下载多个 chunk，提升加载速度
 *
 * 核心配置：
 * - splitChunks.chunks: 'all' 对同步和异步模块都进行分包
 * - cacheGroups.vendors.test: 匹配 node_modules 路径的模块
 * - cacheGroups.vendors.name: 指定 vendor chunk 的名称
 * - cacheGroups.vendors.priority: 优先级，数值越大优先级越高
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
    splitChunks: {
      // 对所有类型的模块（同步 + 异步）进行分包
      chunks: 'all',
      cacheGroups: {
        // 将第三方依赖分离到单独的 vendor chunk
        vendors: {
          name: 'vendors',
          // 匹配 node_modules 中的模块
          test: /[\\/]node_modules[\\/]/,
          // 优先级：数值越大越优先，确保第三方库被分到 vendors 而非 default
          priority: 10,
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: '第三方依赖分离'
    })
  ]
}

export default config
