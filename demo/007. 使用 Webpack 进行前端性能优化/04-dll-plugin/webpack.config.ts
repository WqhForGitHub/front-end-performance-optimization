import { Configuration, DllReferencePlugin } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

/**
 * 主构建配置（第二步执行：npm run build）
 *
 * 通过 DllReferencePlugin 引用上一步生成的 manifest，webpack 在打包时
 * 遇到 lodash 等已包含在 dll 中的模块时，不会把它们打进 bundle，
 * 而是运行时从全局变量 vendor_lib 取值，从而减小 bundle 体积、加快构建。
 *
 * 运行时需要先加载 vendor.dll.js，因此：
 * - index.html 模板中手动引入 vendor.dll.js
 * - 通过 CopyPlugin 把 dll/vendor.dll.js 拷贝到 dist 目录
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.[contenthash:8].js',
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
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new DllReferencePlugin({
      manifest: path.resolve(__dirname, 'dll/vendor.manifest.json'),
      name: 'vendor_lib',
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'dll/vendor.dll.js'),
          to: 'vendor.dll.js',
        },
      ],
    }),
  ],
}

export default config
