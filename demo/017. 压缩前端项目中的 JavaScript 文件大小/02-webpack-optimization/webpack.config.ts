import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

/**
 * 方案二：Webpack + TerserPlugin 代码压缩与优化
 *
 * 关键配置点：
 *
 * 1. optimization.minimize = true
 *    开启压缩（生产模式默认开启，显式写出便于演示）。
 *
 * 2. optimization.minimizer = [new TerserPlugin({...})]
 *    使用 TerserPlugin 作为 JS 压缩器，可细粒度控制：
 *      - terserOptions.compress.drop_console = true   移除 console.*
 *      - terserOptions.compress.drop_debugger = true  移除 debugger
 *      - terserOptions.format.comments = false         移除注释
 *      - terserOptions.mangle.toplevel = true          顶层变量混淆
 *      - extractComments = false                       不抽取注释到 LICENSE.txt
 *
 * 3. optimization.splitChunks
 *    代码分割（Code Splitting）：
 *      - chunks: 'all'           同步 + 异步 chunk 都参与分割
 *      - cacheGroups.vendor      把 node_modules 拆为单独 vendor chunk
 *      - cacheGroups.react       把 react / react-dom 拆为 react chunk
 *      - minSize / maxSize       控制 chunk 大小阈值，避免过小 chunk
 *
 * 4. optimization.usedExports = true + sideEffects: false (package.json)
 *    Tree Shaking：标记未使用的导出，由 Terser 在压缩阶段移除。
 *
 * 5. optimization.runtimeChunk = 'single'
 *    把 webpack runtime 提取到单独文件，避免业务代码变化影响 vendor 长缓存。
 *
 * 6. output 文件名带 [contenthash]，配合长缓存策略。
 *
 * 7. resolve.extensions 配置 .ts/.tsx/.js/.jsx 解析顺序。
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  optimization: {
    // 1. 开启压缩
    minimize: true,
    // 2. 配置压缩器
    minimizer: [
      new TerserPlugin({
        // 并发数（默认 os.cpus().length - 1）
        parallel: true,
        // 不抽取注释到单独的 LICENSE.txt
        extractComments: false,
        terserOptions: {
          compress: {
            // 移除所有 console.* 调用
            drop_console: true,
            // 移除 debugger 语句
            drop_debugger: true,
            // 死代码消除
            dead_code: true,
            // 移除未使用变量 / 函数
            unused: true,
            // 编译期计算常量表达式
            evaluate: true,
            // 合并变量声明
            join_vars: true,
            // 优化条件表达式（如连续 if 合并）
            sequences: true,
            // 内联简单函数
            inline: 1,
          },
          format: {
            // 移除所有注释
            comments: false,
          },
          mangle: {
            // 顶层变量名混淆
            toplevel: true,
            // 保留 eval 作用域
            eval: false,
          },
        },
      }),
    ],
    // 3. 代码分割
    splitChunks: {
      chunks: 'all',
      // chunk 最小体积（字节），小于此值不拆分
      minSize: 20000,
      // chunk 最大体积（字节），超过会尝试继续拆分
      maxSize: 244000,
      minRemainingSize: 0,
      minChunks: 1,
      cacheGroups: {
        // 默认 vendor 组：node_modules 中的模块
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
          reuseExistingChunk: true,
        },
        // react 单独拆分（变化频率低，便于长缓存）
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 0,
          reuseExistingChunk: true,
        },
      },
    },
    // 4. Tree Shaking：标记未使用的导出（生产模式默认 true）
    usedExports: true,
    // 5. 运行时单独拆分
    runtimeChunk: 'single',
    // 模块拼接（Scope Hoisting）：生产模式默认开启
    concatenateModules: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],
  devServer: {
    port: 5232,
    hot: true,
    open: false,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
  },
  // 生产模式默认 devtool: false（无 sourcemap）
  devtool: false,
  performance: {
    hints: false,
    maxAssetSize: 1024 * 1024,
    maxEntrypointSize: 1024 * 1024,
  },
}

export default config
