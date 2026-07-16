/**
 * 多入口分包配置
 *
 * 原理：通过配置多个 entry 入口，Webpack 会为每个入口生成独立的 bundle。
 * 每个页面只加载自己需要的代码，避免加载其他页面的代码。
 *
 * 适用场景：多页面应用（MPA），每个页面相互独立。
 *
 * 核心配置：
 * - entry: 配置多个入口，key 为 chunk 名称，value 为入口文件路径
 * - output.filename: 使用 [name] 占位符，每个入口输出独立文件
 * - HtmlWebpackPlugin: 为每个页面生成独立 HTML，通过 chunks 指定只引入对应入口
 */
import path from 'path'
import type { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  // 多入口配置：每个入口对应一个页面，生成独立的 bundle
  entry: {
    pageA: './src/pages/pageA.ts',
    pageB: './src/pages/pageB.ts',
    pageC: './src/pages/pageC.ts'
  },
  output: {
    // [name] 会被替换为 entry 的 key（pageA / pageB / pageC）
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
          loader: 'ts-loader',
          options: { transpileOnly: true }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    // 为每个页面生成独立的 HTML 文件，通过 chunks 指定只引入对应入口的 bundle
    new HtmlWebpackPlugin({
      filename: 'pageA.html',
      template: './index.html',
      chunks: ['pageA'],
      title: '页面 A - 多入口分包'
    }),
    new HtmlWebpackPlugin({
      filename: 'pageB.html',
      template: './index.html',
      chunks: ['pageB'],
      title: '页面 B - 多入口分包'
    }),
    new HtmlWebpackPlugin({
      filename: 'pageC.html',
      template: './index.html',
      chunks: ['pageC'],
      title: '页面 C - 多入口分包'
    })
  ]
}

export default config
