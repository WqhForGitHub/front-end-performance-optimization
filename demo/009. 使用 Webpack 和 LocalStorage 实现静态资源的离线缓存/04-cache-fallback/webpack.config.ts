import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * 带降级策略的缓存 -- 演示
 *
 * 策略：Cache-First with Network Fallback
 *   1. 先查 LocalStorage -> 命中直接返回
 *   2. 未命中 -> 网络 -> 成功后写入 LocalStorage
 *   3. 网络失败 -> 返回错误（调用方降级展示「离线」）
 *
 * 容量管理：
 *   - 写入失败时触发 LRU 淘汰（按 lastAccessAt 升序删除最旧条目）
 *   - 同时维护最大条目数（默认 50），超出时主动淘汰
 *
 * 观察方式：
 *   - 第一次访问 -> 全部走网络（NETWORK）
 *   - 刷新 -> 全部走缓存（CACHE）
 *   - 离线（断网）+ 已有缓存 -> 仍可正常加载（CACHE）
 *   - 离线 + 无缓存 -> 返回 error，页面降级提示
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
