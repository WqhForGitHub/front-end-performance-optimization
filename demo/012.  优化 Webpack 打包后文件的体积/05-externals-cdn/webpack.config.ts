/**
 * externals + CDN - webpack 配置
 *
 * 优化点：
 * 使用 externals 将 lodash 排除出打包产物，
 * 改为通过 CDN <script> 标签加载。
 *
 * 优势：
 * 1. 减小打包体积，lodash（约 70KB）不打包进产物
 * 2. CDN 资源可被浏览器并行加载
 * 3. CDN 资源可被多站点共享缓存
 * 4. 不变更第三方库时，产物 hash 不变，利于缓存
 *
 * 通过 --bundle 参数可将 lodash 打包进产物，用于对比体积差异
 *
 * externals 配置说明：
 * - key: 模块导入名（import _ from 'lodash'）
 * - value: 全局变量名（CDN 暴露的变量）
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
  // 判断是否通过 --bundle 将 lodash 打包进产物
  const bundle = argv['bundle'] === true

  return {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: bundle ? 'bundle.with-lodash.js' : 'bundle.cdn.js',
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
    // externals: 将指定模块排除出打包产物
    // 当 bundle 为 true 时，不排除 lodash（打包进产物）
    externals: bundle
      ? {}
      : {
          // key: import 的模块名
          // value: CDN 暴露的全局变量名
          lodash: '_',
        },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
  }
}

export default config
