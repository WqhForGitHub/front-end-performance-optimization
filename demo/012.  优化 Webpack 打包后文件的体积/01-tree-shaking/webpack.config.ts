/**
 * Tree Shaking 深度优化 - webpack 配置
 *
 * Tree Shaking（摇树优化）的核心原理：
 * 1. 基于 ES Module 的静态结构，在编译阶段分析模块的导入与导出
 * 2. 标记未被使用的导出（usedExports）
 * 3. 在压缩阶段将未被使用的代码移除（minify）
 *
 * 关键配置项：
 * - mode: production 模式下默认开启 tree shaking
 * - optimization.usedExports: 标记未使用的导出
 * - optimization.sideEffects: 配合 package.json 的 sideEffects 字段
 * - optimization.providedExports: 分析模块的导出
 *
 * 通过 --no-shake 参数可关闭 tree shaking，用于对比打包体积差异
 */
import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * 导出函数形式的配置，便于根据 argv 参数动态切换配置
 * @param _env 环境变量（未使用）
 * @param argv 命令行参数，包含 mode、自定义参数等
 * @returns webpack 配置对象
 */
const config = (_env: unknown, argv: Record<string, unknown>): Configuration => {
  // 判断是否通过 --no-shake 关闭 tree shaking
  const noShake = argv['no-shake'] === true

  return {
    // 生产模式默认开启 tree shaking 和代码压缩
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: noShake ? 'bundle.no-shake.js' : 'bundle.js',
      clean: true,
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
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
    optimization: {
      // usedExports: 开启标记未使用的导出
      // 当 noShake 为 true 时关闭，模拟未启用 tree shaking 的场景
      usedExports: !noShake,
      // sideEffects: true 表示读取 package.json 的 sideEffects 字段
      // 当 noShake 为 true 时设为 false，忽略副作用标记
      sideEffects: !noShake,
      // 压缩代码，移除被标记为未使用的代码
      minimize: true,
    },
    // 生产环境默认开启，这里显式设置以便对比
    devtool: noShake ? 'source-map' : false,
  }
}

export default config
