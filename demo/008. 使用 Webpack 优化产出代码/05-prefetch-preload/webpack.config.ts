import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Prefetch / Preload 演示
 *
 * 原理：webpack 支持在动态 import() 中使用魔法注释来添加资源提示：
 *
 * 1. webpackPrefetch: true
 *    在浏览器空闲时预拉取资源（使用 <link rel="prefetch">）。
 *    资源会被下载并缓存，但不会执行。
 *    适合：用户「可能」会访问的下一页资源。
 *
 * 2. webpackPreload: true
 *    与当前页面资源并行预加载（使用 <link rel="preload">）。
 *    资源会以高优先级下载，适合当前页面「一定」会用到的关键资源。
 *    适合：当前页面的关键异步 chunk。
 *
 * 区别：
 * - Prefetch: 空闲时下载，优先级低，用于未来可能需要的资源
 * - Preload:  并行下载，优先级高，用于当前一定需要的资源
 *
 * 观察方式：
 * - 构建后打开页面，查看 <head> 中的 <link rel="prefetch"> 和 <link rel="preload">
 * - 在 DevTools Network 面板观察资源的加载时机和优先级
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: 'chunks/[name].[contenthash:8].js',
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
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
}

export default config
