import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * image-webpack-loader 演示
 *
 * 原理：image-webpack-loader 在打包时对图片进行有损/无损压缩，
 * 自动减小图片体积，从而减少网络传输量，加快页面加载。
 *
 * 它内部依赖各个图片格式的优化工具：
 * - mozjpeg  压缩 JPEG
 * - optipng  压缩 PNG
 * - pngquant 压缩 PNG（有损）
 * - gifsicle 压缩 GIF
 * - svgo     压缩 SVG
 * - webp     转换为 WebP
 *
 * 与 webpack 5 内置的 asset/resource 配合使用时，
 * image-webpack-loader 作为预处理 loader 放在 use 中，
 * asset/resource 负责把压缩后的图片输出到目标目录。
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
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[contenthash:8].[ext]',
        },
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                quality: 70,
                progressive: true,
              },
              optipng: {
                enabled: true,
                optimizationLevel: 7,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              svgo: {
                enabled: true,
              },
            },
          },
        ],
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
