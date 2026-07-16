import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Tree Shaking 演示
 *
 * 原理：webpack 在生产模式下自动开启 Tree Shaking，通过两个机制配合：
 *
 * 1. usedExports（optimization.usedExports）
 *    webpack 分析模块的导入导出关系，标记哪些导出被实际使用，
 *    未被使用的导出会被 terser 在压缩阶段移除。
 *
 * 2. sideEffects（package.json 的 sideEffects 字段）
 *    - `"sideEffects": false` 表示项目中的所有模块都是"纯"的，
 *      即没有任何副作用（如修改全局变量、注册全局事件等），
 *      webpack 可以安全地删除未被引用的整个模块文件。
 *    - 如果某些文件有副作用，可以写成数组白名单：
 *      `"sideEffects": ["./src/polyfill.ts", "*.css"]`
 *
 * 对比：
 * - `npm run build`          -> 开启 Tree Shaking，未使用的函数不会出现在产物中
 * - `npm run build:no-shake` -> 关闭 usedExports，对比产物体积差异
 *
 * 注意：Tree Shaking 只对 ESM（import/export）有效，CommonJS（require）无效。
 */
export default (_env: unknown, argv: Record<string, unknown>): Configuration => {
  const noShake = argv.noShake === true

  return {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      filename: noShake ? 'bundle.no-shake.[contenthash:8].js' : 'bundle.[contenthash:8].js',
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
      // usedExports: true 让 webpack 标记未使用的导出
      // 生产模式默认为 true，这里显式写出便于对比
      usedExports: !noShake,
      // minimize 确保压缩器（terser）真正移除被标记为 unused 的代码
      minimize: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
  }
}
