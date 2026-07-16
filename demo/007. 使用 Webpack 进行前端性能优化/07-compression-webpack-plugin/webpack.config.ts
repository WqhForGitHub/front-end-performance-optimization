import { Configuration } from 'webpack'
import CompressionPlugin from 'compression-webpack-plugin'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * compression-webpack-plugin 演示
 *
 * 原理：在打包产物的基础上，额外生成 .gz（gzip）压缩文件。
 * 当服务器（如 Nginx）开启 gzip_static 时，可直接返回预压缩文件，
 * 省去服务器实时压缩的开销，并显著减小传输体积（通常可减小 60%~80%）。
 *
 * 关键参数：
 * - algorithm：压缩算法，'gzip' 或 'brotliCompress'
 * - threshold：仅处理大于该体积（字节）的资源
 * - minRatio：压缩率低于该值才生成压缩文件
 * - deleteOriginalAssets：是否删除原始文件（一般保留）
 *
 * 注意：本 demo 使用 compression-webpack-plugin@10（自带类型声明，
 * 与 webpack 5 配合良好）。
 */
const config: Configuration = {
  mode: 'production',
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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      // 仅压缩大于 10KB 的资源
      threshold: 10240,
      // 压缩率需低于 0.8 才生成
      minRatio: 0.8,
    }),
  ],
}

export default config
