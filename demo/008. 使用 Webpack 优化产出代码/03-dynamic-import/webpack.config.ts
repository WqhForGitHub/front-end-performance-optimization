import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Dynamic Import（动态导入）演示
 *
 * 原理：使用 `import()` 语法（动态导入）时，webpack 会自动将
 * 动态导入的模块拆分为独立的 chunk（异步代码块）。
 * 这些 chunk 在运行时按需加载，不会阻塞首屏渲染。
 *
 * 应用场景：
 * - 路由级懒加载（SPA 按路由分割）
 * - 大型组件按需加载（如图表编辑器、富文本编辑器）
 * - 条件性功能加载（如仅部分用户使用的导出功能）
 *
 * 关键配置：
 * - output.chunkFilename: 异步 chunk 的命名规则
 * - optimization.splitChunks: 可进一步拆分异步 chunk 中的公共依赖
 *
 * 对比：
 * - 静态 import -> 所有代码打进一个 bundle，首屏加载全部
 * - 动态 import() -> 拆分为多个 chunk，按需加载，减小首屏体积
 *
 * 魔法注释：
 * - webpackChunkName: 自定义 chunk 名称
 * - webpackMode: 'lazy'（默认）| 'lazy-once' | 'eager' | 'weak'
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    // 异步 chunk 的命名规则
    chunkFilename: 'chunks/[name].[contenthash:8].js',
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
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 1,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
}

export default config
