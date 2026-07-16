/**
 * gzip 预压缩 - webpack 配置
 *
 * 优化点：
 * 使用 compression-webpack-plugin 在构建时生成 .gz 预压缩文件，
 * 而非在运行时由服务器动态压缩。
 *
 * 优势：
 * 1. 构建时压缩，不占用服务器 CPU 资源
 * 2. 响应速度更快，无需实时压缩开销
 * 3. 可生成更高压缩级别的文件
 *
 * 关键配置：
 * - algorithm: 'gzip' 使用 gzip 算法
 * - threshold: 10240 只有大于 10KB 的文件才压缩
 * - minRatio: 0.8 压缩率低于 0.8 才保留压缩文件
 * - deleteOriginalAssets: false 保留原始文件
 *
 * 服务器需配置 Content-Encoding: gzip 来使用预压缩文件
 */
import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'

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
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CompressionPlugin({
      // 压缩算法
      algorithm: 'gzip',
      // 只处理大于 10KB 的文件（10240 字节）
      threshold: 10240,
      // 最小压缩比率，只有压缩后大小 / 原始大小 < 0.8 才保留
      minRatio: 0.8,
      // 不删除原始文件，同时保留 .js 和 .js.gz
      deleteOriginalAssets: false,
      // 生成 .gz 后缀的压缩文件
      filename: '[path][base].gz',
      // 压缩级别，最高为 9
      compressionOptions: {
        level: 9,
      },
    }),
  ],
  optimization: {
    minimize: true,
  },
}

export default config
