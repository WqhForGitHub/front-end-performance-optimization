import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * thread-loader 演示
 *
 * 原理：thread-loader 会在一个单独的 worker 池中运行它后面的所有 loader，
 * 从而利用多进程并行处理文件，加快编译速度。
 *
 * 注意：与 ts-loader 配合时需要开启 transpileOnly（跳过类型检查）
 * 并设置 happyPackMode: true，因为完整的类型检查依赖 TS 程序实例，
 * 无法在 worker 中安全运行。
 *
 * 类型检查交给 `tsc --noEmit` 单独执行（见 package.json 的 type-check 脚本）。
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
        // thread-loader 放在 ts-loader 之前，
        // 它会把后续 loader 放到 worker 池里并行执行
        use: [
          {
            loader: 'thread-loader',
            options: {
              // worker 数量，一般设置为 CPU 核数 - 1
              workers: 2,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
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
