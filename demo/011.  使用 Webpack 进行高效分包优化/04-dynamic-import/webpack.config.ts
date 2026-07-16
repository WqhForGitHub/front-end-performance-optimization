/**
 * 动态导入懒加载配置
 *
 * 原理：使用 ES 的 import() 语法实现动态导入，Webpack 会将动态导入的模块
 * 拆分为独立的 chunk，在运行时按需加载。
 *
 * 优势：
 * 1. 减小首屏加载的 bundle 体积，加快首屏渲染
 * 2. 用户实际访问某功能时才加载对应代码（按需加载）
 * 3. 配合 webpackChunkName 魔法注释可自定义 chunk 名称
 *
 * 核心配置：
 * - output.chunkFilename: 指定异步 chunk 的文件名格式
 * - 源码中使用 import() 并配合 webpackChunkName 魔法注释自定义 chunk 名称
 *
 * 注意：本配置本身不需要特殊的 splitChunks 设置，
 * 因为 import() 天然会产生独立的 chunk。
 */
import path from 'path'
import type { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    // 主入口 bundle 文件名
    filename: '[name].[contenthash:8].js',
    // 异步加载的 chunk 文件名（通过 import() 产生的 chunk）
    chunkFilename: '[name].[contenthash:8].js',
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
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: '动态导入懒加载'
    })
  ]
}

export default config
