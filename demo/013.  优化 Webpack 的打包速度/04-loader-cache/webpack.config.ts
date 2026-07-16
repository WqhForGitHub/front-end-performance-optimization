/**
 * loader 缓存优化配置示例
 *
 * 原理：loader 在转译源文件时会产生大量重复计算。开启 loader 自身的缓存
 * （或在 Webpack 5 中配合 cache.type='filesystem'）后，未变更的模块会
 * 直接复用上次的转译结果，跳过 ts-loader / babel-loader 等的重复工作。
 *
 * 关键配置：
 * - ts-loader options:
 *   - transpileOnly: true  跳过类型检查，仅做转译，大幅提升单文件速度
 *   - experimentalFileCaching: true  开启实验性文件缓存（结合 Webpack 5 持久化缓存效果更佳）
 *   - onlyCompileBundledFiles: true  只编译被 bundle 引用到的文件，跳过未使用文件
 * - exclude: /node_modules/  第三方依赖已为编译产物，无需再经 loader 处理，必须排除
 *
 * 注意：在 Webpack 5 中，loader 缓存的最佳搭档是顶层 cache.type='filesystem'，
 *      它会自动为参与构建的 loader 结果建立持久化缓存。这里侧重展示 loader 层面的优化。
 */
import path from 'path'
import type { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
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
          options: {
            // 跳过类型检查，只做转译：单文件速度提升明显
            transpileOnly: true,
            // 实验性文件缓存：配合 Webpack 5 持久化缓存复用转译结果
            experimentalFileCaching: true,
            // 只编译被 bundle 实际引用的文件，避免处理无用文件
            onlyCompileBundledFiles: true
          }
        },
        // ===== 关键：排除第三方依赖 =====
        // node_modules 中的库已为发布产物，再次走 loader 既慢又无意义
        exclude: /node_modules/
      }
    ]
  },
  // 配合 loader 缓存：开启文件系统持久化缓存，最大化复用率
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'loader 缓存优化 - 优化打包速度'
    })
  ]
}

export default config
