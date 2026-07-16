import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Scope Hoisting（作用域提升）演示
 *
 * 原理：默认情况下 webpack 把每个模块包裹在一个单独的函数闭包中，
 * 模块之间通过 __webpack_require__ 调用。这会产生大量函数包装代码，
 * 既增大产物体积，又影响运行时性能（额外的函数调用开销）。
 *
 * 开启 Scope Hoisting（optimization.concatenateModules = true）后，
 * webpack 会把多个 ESM 模块"提升"到同一个函数作用域中，
 * 消除不必要的模块包装函数和 __webpack_require__ 调用。
 *
 * 好处：
 * 1. 产物体积更小（减少函数包装代码）
 * 2. 运行时更快（减少函数调用开销）
 * 3. 代码可读性更好（产物中模块代码内联在一起）
 *
 * 对比：
 * - `npm run build`          -> 开启 Scope Hoisting（production 默认）
 * - `npm run build:no-hoist` -> 关闭 concatenateModules，产物中每个模块都有独立闭包
 *
 * 注意：Scope Hoisting 只对 ESM 有效，CommonJS 模块不会被提升。
 */
export default (_env: unknown, argv: Record<string, unknown>): Configuration => {
  const noHoist = argv.noHoist === true

  return {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      filename: noHoist ? 'bundle.no-hoist.[contenthash:8].js' : 'bundle.[contenthash:8].js',
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
    optimization: {
      // concatenateModules: true 启用 Scope Hoisting
      // production 模式下默认为 true，这里显式写出便于对比
      concatenateModules: !noHoist,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
  }
}
