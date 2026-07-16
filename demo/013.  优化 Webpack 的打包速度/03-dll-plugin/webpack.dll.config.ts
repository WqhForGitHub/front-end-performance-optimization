/**
 * DLL 预编译配置（webpack.dll.config.ts）
 *
 * 原理：DLL（Dynamic Link Library）思路把不常变化的第三方依赖（如 lodash）
 * 单独打包成一份独立的 vendor bundle，并生成一个 manifest.json 清单文件。
 * 之后主构建通过 DllReferencePlugin 引用这份清单，把对 lodash 的引用
 * 指向已预编译好的 bundle，从而在主构建中跳过对 lodash 的解析与转译，
 * 显著减少主构建的工作量。
 *
 * 关键配置：
 * - entry: 仅包含第三方库（lodash）
 * - output.library: 暴露的全局变量名，供 manifest 引用
 * - DllPlugin:
 *   - name: 与 output.library 一致
 *   - path: manifest 清单输出路径
 *
 * 执行顺序：
 * 1. `npm run build:dll` —— 先预编译第三方库，生成 dist/vendor.dll.js + vendor-manifest.json
 * 2. `npm run build`    —— 再执行主构建，引用 manifest 跳过 lodash 重新打包
 */
import path from 'path'
import type { Configuration } from 'webpack'
import { DllPlugin } from 'webpack'

const config: Configuration = {
  mode: 'production',
  // 把 lodash 作为 DLL 入口，单独预编译
  entry: {
    vendor: ['lodash']
  },
  output: {
    // 输出文件名：vendor.dll.js
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dist'),
    // 暴露的全局变量名，DllPlugin.name 必须与之相同
    library: '[name]_library',
    clean: false
  },
  plugins: [
    new DllPlugin({
      // 必须与 output.library 一致
      name: '[name]_library',
      // 清单文件输出路径，主构建会读取它
      path: path.resolve(__dirname, 'dist', '[name]-manifest.json')
    })
  ]
}

export default config
