/**
 * 图片压缩 - webpack 配置
 *
 * 优化点：
 * 1. 使用 Webpack 5 Asset Modules（资源模块）处理图片文件
 *    - type: 'asset' 自动根据文件大小选择内联或独立文件
 *    - parser.dataUrlCondition.maxSize: 8KB 以下内联为 base64
 *
 * 2. 使用 image-webpack-loader 在构建时压缩图片
 *    - mozjpeg: JPEG 压缩
 *    - pngquant: PNG 压缩
 *    - optipng: PNG 优化
 *    - svgo: SVG 优化（移除冗余属性、注释等）
 *    - gifsicle: GIF 压缩
 *    - webp: WebP 压缩
 *
 * 注意：image-webpack-loader 需配合 asset modules 使用，
 * 且 loader 执行顺序为从右到左、从下到上，
 * image-webpack-loader 需在资源处理之前执行。
 */
import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    clean: true,
    assetModuleFilename: 'images/[name].[hash:8][ext]',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        // 处理图片文件
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        // 使用 use 数组组合 loader
        // image-webpack-loader 在前（后执行），asset 模块在后（先执行）
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              // mozjpeg: JPEG 压缩配置
              mozjpeg: {
                quality: 80,
                progressive: true,
              },
              // optipng: PNG 优化配置
              optipng: {
                optimizationLevel: 7,
              },
              // pngquant: PNG 压缩配置
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              // gifsicle: GIF 压缩配置
              gifsicle: {
                interlaced: false,
              },
              // webp: WebP 压缩配置
              webp: {
                quality: 75,
              },
              // svgo: SVG 优化配置
              svgo: {
                plugins: [
                  { name: 'removeViewBox', active: false },
                  { name: 'removeEmptyAttrs', active: true },
                  { name: 'removeMetadata', active: true },
                  { name: 'removeComments', active: true },
                  { name: 'cleanupIDs', active: true },
                ],
              },
            },
          },
        ],
        type: 'asset',
        // 资源模块的 parser 配置
        parser: {
          dataUrlCondition: {
            // 小于 8KB 的图片内联为 base64
            maxSize: 8 * 1024,
          },
        },
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
  ],
}

export default config
