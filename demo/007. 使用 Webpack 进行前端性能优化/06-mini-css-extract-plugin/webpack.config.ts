import { Configuration } from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * mini-css-extract-plugin 演示
 *
 * 原理：该插件把 CSS 从 JS 中抽取成独立的 .css 文件，而不是以 <style>
 * 标签内联的方式注入。这样可以：
 * - 让 CSS 与 JS 并行加载，互不阻塞
 * - 利用浏览器对 CSS 文件的缓存机制
 * - 避免大段 CSS 字符串塞在 JS 中影响执行
 *
 * 压缩 CSS 使用 css-minimizer-webpack-plugin（放在 optimization.minimizer），
 * 它会在生产模式下压缩 CSS 文件。
 *
 * 说明：开发环境推荐用 style-loader（HMR 友好），
 * 生产环境用 MiniCssExtractPlugin.loader。
 */
const isProd = process.env.NODE_ENV === 'production'

const config: Configuration = {
  mode: isProd ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.[contenthash:8].js',
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
      {
        test: /\.css$/,
        use: [
          // 生产用抽取，开发用 style-loader（这里直接用抽取便于演示产物）
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  optimization: {
    minimizer: [
      // 压缩 CSS（生产模式下生效）
      new CssMinimizerPlugin(),
    ],
  },
}

export default config
