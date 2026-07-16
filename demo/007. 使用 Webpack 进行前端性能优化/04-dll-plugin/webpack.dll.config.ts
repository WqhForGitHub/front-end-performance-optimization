import { Configuration, DllPlugin } from 'webpack'
import path from 'path'

/**
 * DLL 配置（第一步执行：npm run build:dll）
 *
 * 原理：DllPlugin 把不常变化的第三方依赖（如 lodash）预先打包成一个
 * 独立的 vendor.dll.js，并生成一份 manifest.json 清单。
 *
 * 之后主构建通过 DllReferencePlugin 引用这份清单，遇到这些依赖时
 * 不再重复打包，而是直接使用预打包好的 dll，从而加快构建速度。
 */
const config: Configuration = {
  mode: 'production',
  entry: {
    vendor: ['lodash'],
  },
  output: {
    filename: 'vendor.dll.js',
    path: path.resolve(__dirname, 'dll'),
    // library 名必须与 DllPlugin 的 name 一致，
    // 它会把打包结果挂载到全局变量上，供运行时引用
    library: 'vendor_lib',
  },
  plugins: [
    new DllPlugin({
      name: 'vendor_lib',
      path: path.resolve(__dirname, 'dll/vendor.manifest.json'),
    }),
  ],
}

export default config
