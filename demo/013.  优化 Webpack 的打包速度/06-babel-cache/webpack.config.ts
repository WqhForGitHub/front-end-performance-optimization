/**
 * babel-loader 缓存配置示例
 *
 * 原理：用 babel-loader 替代 ts-loader 来转译 TypeScript。
 * @babel/preset-typescript 负责剥离 TS 类型语法，@babel/preset-env 负责
 * 按目标环境降级 ES 语法。babel-loader 的 cacheDirectory 选项会把转译
 * 结果缓存到 node_modules/.cache/babel-loader，未变更的文件二次构建
 * 直接复用，跳过 Babel 的重新解析与生成，提速明显。
 *
 * 关键配置：
 * - loader: 'babel-loader'
 * - options.cacheDirectory: true  开启文件缓存（默认缓存到 node_modules/.cache/babel-loader）
 * - options.cacheCompression: false  关闭缓存压缩，牺牲一点磁盘换更快读取
 * - presets: ['@babel/preset-env', '@babel/preset-typescript']
 *
 * 与 ts-loader 的对比：
 * - babel-loader 不做类型检查，只转译，单文件速度更快；
 * - 类型检查交给独立的 `tsc --noEmit`（即 npm run type-check），实现转译与检查解耦。
 * - cacheDirectory 是 babel-loader 自身的缓存机制，独立于 Webpack 5 的 cache.type。
 */
import path from 'path'
import type { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          // ===== 核心：babel-loader + 缓存 =====
          loader: 'babel-loader',
          options: {
            // 开启缓存目录，二次构建复用转译结果
            cacheDirectory: true,
            // 不压缩缓存文件，读取更快
            cacheCompression: false,
            presets: [
              ['@babel/preset-env', { targets: { browsers: ['> 1%', 'last 2 versions'] } }],
              '@babel/preset-typescript'
            ]
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'babel-loader 缓存 - 优化打包速度'
    })
  ]
}

export default config
