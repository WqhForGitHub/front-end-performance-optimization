/**
 * 主构建配置（引用 DLL 预编译产物）
 *
 * 原理：通过 DllReferencePlugin 读取上一步 DLL 构建生成的 manifest.json，
 * 把业务代码中对 lodash 的 import 映射到全局变量 `vendor_library`，
 * 这样 Webpack 在主构建时就不再把 lodash 重新打包，直接复用预编译产物。
 *
 * 关键配置：
 * - DllReferencePlugin.manifest: 指向上一步生成的 vendor-manifest.json
 * - 业务代码照常 `import { chunk } from 'lodash'`，无需改动
 *
 * 运行时还需要在 HTML 中手动引入 vendor.dll.js（或在主构建中通过其它插件注入）。
 * 这里通过 HtmlWebpackPlugin 的 inject 配置说明运行时依赖关系。
 */
import path from 'path'
import type { Configuration } from 'webpack'
import { DllReferencePlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: false
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
    // ===== 核心：引用 DLL 清单，跳过 lodash 重新打包 =====
    new DllReferencePlugin({
      // 读取 DLL 构建产出的清单文件
      manifest: path.resolve(__dirname, 'dist', 'vendor-manifest.json'),
      // 上下文目录，通常为项目根目录
      context: __dirname
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'DLL 预编译 - 优化打包速度'
    })
  ]
}

export default config
