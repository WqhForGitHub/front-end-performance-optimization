import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * splitChunks 演示
 *
 * 原理：splitChunks 能自动识别并提取公共模块，打包成单独的 chunk：
 * - vendors：来自 node_modules 的第三方依赖，被多个入口共享
 * - common：被至少 minChunks 个 chunk 共享的本地模块
 *
 * 好处：
 * - 避免公共代码在多个入口中重复打包
 * - 公共 chunk 可被浏览器长期缓存（依赖不变则 hash 不变）
 *
 * 本 demo 提供两个入口 pageA / pageB，它们都引用：
 * - lodash（第三方，进入 vendors）
 * - src/shared/format.ts（本地公共，进入 common）
 */
const config: Configuration = {
  mode: 'production',
  entry: {
    pageA: './src/pages/pageA.ts',
    pageB: './src/pages/pageB.ts',
  },
  output: {
    filename: '[name].[contenthash:8].js',
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
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 1,
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
          name: 'common',
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'pageA.html',
      template: './index.html',
      chunks: ['vendors', 'common', 'pageA'],
    }),
    new HtmlWebpackPlugin({
      filename: 'pageB.html',
      template: './index.html',
      chunks: ['vendors', 'common', 'pageB'],
    }),
  ],
}

export default config
