import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * 基于 contenthash 的版本化缓存 -- 演示
 *
 * 思路：
 *   1. 产物文件名带 [contenthash:8]，资源内容变化时 hash 自动变化
 *      -> 浏览器原生缓存 + 我们自己的 LocalStorage 缓存都按 hash 区分版本。
 *   2. 运行时 ResourceCache 通过解析 URL 中的 hash 作为缓存 key，
 *      只有「hash 真正变了」的资源才会重新拉取。
 *   3. 同时清理同逻辑名下「过期 hash」的旧缓存，避免 LocalStorage 无限增长。
 *
 * 观察方式：
 *   - npm run build 后，dist/js/ 下产物名形如 bundle.abcd1234.js
 *   - 修改 src/index.ts 内容后重新 build，hash 会变化，对应资源走网络；
 *     其他未改动的资源 hash 不变，仍可走 LocalStorage 缓存。
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'js/bundle.[contenthash:8].js',
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
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
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
