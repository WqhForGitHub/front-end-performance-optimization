/**
 * 条件 externals 配置演示
 *
 * 原理：
 *   webpack 的 `externals` 字段可以告诉 webpack"某些依赖不要打包，
 *   运行时从全局变量取"。`externals` 既可以是对象，也可以是函数。
 *
 *   使用函数形式时，我们可以根据 `mode`（或 --env 参数）动态决定
 *   是否把某个库（如 lodash）external 化：
 *     - 开发模式：把 lodash 打进 bundle，省去配置 CDN，调试方便。
 *     - 生产模式：lodash 走 CDN，bundle 体积更小，首屏更快。
 *
 * 函数签名：
 *   externals: (data, callback) => void
 *   - data: { context, request, contextInfo, dependencyType }
 *   - callback(err, result)
 *
 *   result 可以是：string | string[] | boolean | Record<string, unknown>
 *   - 返回字符串：表示该 request 映射到某个全局变量
 *   - 返回 undefined/不调用 callback：交给下一条规则处理
 *   - 返回 false：明确表示"不要 external"
 */
import path from 'path'
import webpack, { Configuration, DefinePlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const NODE_ENV: string = process.env.NODE_ENV || 'development'
const isProd: boolean = NODE_ENV === 'production'

const config: Configuration = {
  mode: isProd ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
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
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    /**
     * 注入一个全局标记，让 index.html 知道是否需要从 CDN 加载 lodash。
     * 生产构建里为 true，开发构建里为 false。
     */
    new DefinePlugin({
      __USE_LODASH_CDN__: JSON.stringify(isProd),
    }),
  ],
  /**
   * 核心：函数式 externals
   *
   * - 开发模式：callback(undefined, false) 表示"不 external，正常打包 lodash"。
   * - 生产模式：callback(undefined, 'lodash') 表示"lodash 走全局变量 window._"。
   *
   * 这样开发与生产共用同一份业务代码，但产物里 lodash 的处理方式不同。
   */
  externals: (
    _data: { request?: string },
    callback: (err?: Error | null, result?: unknown) => void
  ) => {
    const data = _data as { request?: string }
    if (data.request === 'lodash') {
      if (isProd) {
        // 生产：把 import 'lodash' 映射到全局变量 lodash（即 window._）
        callback(null, 'lodash')
      } else {
        // 开发：不 external，lodash 正常打包进 bundle
        callback(null, false)
      }
      return
    }
    // 其他模块走默认流程
    callback()
  },
}

export default config
