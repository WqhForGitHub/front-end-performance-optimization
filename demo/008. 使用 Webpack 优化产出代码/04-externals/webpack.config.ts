import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Externals（外部依赖）演示
 *
 * 原理：通过 `externals` 配置，将某些依赖排除在打包之外。
 * 这些依赖在运行时通过 CDN <script> 标签或其他方式加载，
 * webpack 不会把它们打进 bundle，而是直接引用全局变量。
 *
 * 适用场景：
 * - 体积较大的库（如 lodash、moment、jQuery）通过 CDN 加载
 * - 多个项目共享同一份库（避免重复打包）
 * - 库开发时将 peerDependencies 排除（如 React、Vue）
 *
 * 配置说明：
 * - key: 模块名（import 时的名称）
 * - value: 全局变量名（CDN 脚本挂载到 window 上的变量）
 * - 例如 lodash -> window._
 *
 * 对比：
 * - `npm run build`         -> lodash 通过 CDN 引入，不打包进 bundle
 * - `npm run build:bundle`  -> lodash 打包进 bundle，对比体积差异
 *
 * 注意：index.html 中需要通过 <script> 引入 CDN 链接。
 */
export default (_env: unknown, argv: Record<string, unknown>): Configuration => {
  const bundleAll = argv.bundleAll === true

  const config: Configuration = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      filename: bundleAll ? 'bundle.bundled.[contenthash:8].js' : 'bundle.[contenthash:8].js',
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

  if (!bundleAll) {
    // externals: lodash 不打包，运行时从全局变量 _ 获取
    config.externals = {
      lodash: '_',
    }
  }

  return config
}
