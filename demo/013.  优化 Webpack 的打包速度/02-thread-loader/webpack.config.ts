/**
 * 多进程并行打包（thread-loader）配置示例
 *
 * 原理：默认情况下 Webpack 在主线程中串行执行 loader 转译。
 * 当 TypeScript 文件较多时，ts-loader 的类型剥离会占用大量 CPU 时间。
 * thread-loader 会启动一个 worker 池，把后续 loader（如 ts-loader）放到
 * 多个子进程中并行执行，从而充分利用多核 CPU，缩短整体构建时间。
 *
 * 关键配置：
 * - use: ['thread-loader', 'ts-loader']
 *   thread-loader 放在 ts-loader 之前，ts-loader 会在 worker 中运行。
 * - thread-loader options.workers: worker 数量，通常设为 CPU 核数 - 1。
 * - ts-loader happyPackMode: true
 *   必须开启，否则 ts-loader 在 worker 进程中无法正常工作（它会假设
 *   被多线程调用并禁用文件监听、报告错误等逻辑）。
 *
 * 注意事项：
 * - thread-loader 本身有进程通信开销，文件少时反而可能更慢，适用于中大型项目。
 * - worker 进程无法访问主进程的 API，不能使用带副作用的 loader。
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
        use: [
          {
            // ===== 核心：thread-loader 启动 worker 池 =====
            loader: 'thread-loader',
            options: {
              // worker 数量：建议设置为 CPU 核数 - 1
              workers: 2,
              // worker 进程空闲后多久销毁（ms）
              workerParallelJobs: 20,
              workerNodeArgs: [],
              poolRespawn: false,
              poolTimeout: 2000
            }
          },
          {
            loader: 'ts-loader',
            options: {
              // 必须开启：使 ts-loader 适配多线程模式
              happyPackMode: true,
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      title: '多进程并行打包 - 优化打包速度'
    })
  ]
}

export default config
