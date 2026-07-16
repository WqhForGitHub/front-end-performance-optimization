/**
 * 公共模块提取配置
 *
 * 原理：当多个入口共享相同的模块时，splitChunks 会自动将公共模块
 * 提取到独立的 common chunk 中，避免重复打包。
 *
 * 对比多入口分包（01-entry-split）：
 * - 01 中 shared/utils.ts 会被重复打包进每个页面的 bundle
 * - 本示例通过 cacheGroups.common 将共享模块提取到独立的 common chunk
 *
 * 核心配置：
 * - cacheGroups.vendors: 分离第三方依赖
 * - cacheGroups.common: 提取被 >= minChunks 个入口共享的业务模块
 * - minChunks: 2 表示被 2 个及以上入口引用的模块会被提取
 * - minSize: 0 表示不限制最小体积（默认 20000 字节，演示用设为 0）
 * - priority: 优先级，vendors(10) > common(5)，确保第三方库优先匹配 vendors
 */
import path from 'path'
import type { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  // 两个页面入口，共享 shared/ 下的模块
  entry: {
    pageA: './src/pages/pageA.ts',
    pageB: './src/pages/pageB.ts'
  },
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
      chunks: 'all',
      // 设为 0 以便演示小模块也能被提取（生产环境建议使用默认值）
      minSize: 0,
      cacheGroups: {
        // 第三方依赖分离
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        },
        // 公共业务模块提取：被 2 个及以上入口共享的模块会被提取到 common chunk
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    // 每个页面的 HTML 引入 vendors + common + 对应页面 chunk
    new HtmlWebpackPlugin({
      filename: 'pageA.html',
      template: './index.html',
      chunks: ['vendors', 'common', 'pageA'],
      title: '页面 A - 公共模块提取'
    }),
    new HtmlWebpackPlugin({
      filename: 'pageB.html',
      template: './index.html',
      chunks: ['vendors', 'common', 'pageB'],
      title: '页面 B - 公共模块提取'
    })
  ]
}

export default config
