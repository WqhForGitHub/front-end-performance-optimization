/**
 * CSS 抽取与压缩 - webpack 配置
 *
 * 优化点：
 * 1. 使用 MiniCssExtractPlugin 将 CSS 从 JS 中抽取为独立文件
 *    - 避免 JS 内联 CSS 导致的 FOUC（内容闪烁）问题
 *    - CSS 可被浏览器并行加载，并利用缓存
 *    - JS 和 CSS 分离，各自缓存独立
 *
 * 2. 使用 CssMinimizerWebpackPlugin 压缩 CSS
 *    - 移除注释和空白字符
 *    - 简写属性合并
 *    - 精简颜色值（如 #ffffff -> #fff）
 *
 * 3. 配合 cacheGroups 将 CSS 单独分组
 */
import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        // 使用 MiniCssExtractPlugin.loader 替代 style-loader
        // 将 CSS 抽取为独立文件而非内联到 JS 中
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.css'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new MiniCssExtractPlugin({
      // 输出独立的 CSS 文件，带 contenthash 以便长效缓存
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[id].[contenthash:8].css',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      // 使用 CssMinimizerPlugin 压缩 CSS
      new CssMinimizerPlugin({
        // parallel: true 使用多进程并行压缩，提升构建速度
        parallel: true,
      }),
    ],
  },
}

export default config
