import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * babel-loader 缓存演示
 *
 * 原理：开启 cacheDirectory 后，babel-loader 会把转译结果缓存到
 * node_modules/.cache/babel-loader 目录。再次构建时，未改动的文件
 * 直接复用缓存，跳过 babel 转译过程，大幅提升二次构建速度。
 *
 * 这里用 @babel/preset-typescript 处理 TS 语法，
 * 类型检查交给 `tsc --noEmit` 单独执行。
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
        use: [
          {
            loader: 'babel-loader',
            options: {
              // 开启缓存，加速二次构建
              cacheDirectory: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: { browsers: ['> 1%', 'last 2 versions'] },
                  },
                ],
                '@babel/preset-typescript',
              ],
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
