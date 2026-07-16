import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

/**
 * Bundle Analysis（产物分析）演示
 *
 * 原理：webpack-bundle-analyzer 插件会在构建后生成一个可视化报告，
 * 以 Treemap（矩形树图）方式展示产物中每个模块的体积占比。
 *
 * 用途：
 * - 发现体积异常的模块（如意外引入了大库）
 * - 分析依赖关系，找出重复打包的模块
 * - 评估 Tree Shaking、Code Splitting 等优化效果
 * - 对比优化前后的产物体积变化
 *
 * 配置说明：
 * - analyzerMode: 'server' -> 启动本地服务器打开报告（默认 8888 端口）
 * - analyzerMode: 'static'  -> 生成静态 HTML 报告文件
 * - analyzerMode: 'json'    -> 生成 JSON 格式数据
 * - openAnalyzer: 是否自动打开浏览器
 *
 * 使用方式：
 * - `npm run build` -> 构建并自动打开分析报告
 * - 也可结合 `webpack --profile --json > stats.json` 使用 webpack 官方分析工具
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
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new BundleAnalyzerPlugin({
      // 生成静态 HTML 报告到 dist 目录
      analyzerMode: 'static',
      // 报告文件名
      reportFilename: 'bundle-report.html',
      // 不自动打开浏览器（避免干扰 CI）
      openAnalyzer: false,
      // 显示模块的 gzip 压缩后大小
      defaultSizes: 'gzip',
    }),
  ],
}

export default config
