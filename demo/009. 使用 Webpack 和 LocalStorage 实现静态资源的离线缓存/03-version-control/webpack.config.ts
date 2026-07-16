import { Configuration, DefinePlugin } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * 带版本管理的缓存 -- 演示
 *
 * 思路：
 *   1. 通过 DefinePlugin 注入 __APP_VERSION__（来自环境变量或构建时间戳），
 *      每次部署都会得到一个新版本号。
 *   2. 运行时 VersionedCache 启动时先 detectVersion：
 *        - 版本一致 -> 复用现有 LocalStorage 缓存
 *        - 版本变化 -> 全部清空，再以新版本号重新拉取并写入
 *      这样保证「一次部署后所有缓存都属于同一版本」，避免新老混合。
 *   3. 同时记录版本变更历史，便于页面展示与排查。
 *
 * 观察方式：
 *   - 第一次访问：版本从无 -> v1.x，全部 MISS
 *   - 刷新：版本不变，全部 HIT
 *   - 修改 __APP_VERSION__ 后重新 build：版本变化，自动清空再重新拉取
 */
const APP_VERSION = `v${Date.now().toString(36)}`

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
    // 注入应用版本号，用于运行时版本对比与缓存失效
    new DefinePlugin({
      __APP_VERSION__: JSON.stringify(APP_VERSION),
    }),
  ],
}

export default config
