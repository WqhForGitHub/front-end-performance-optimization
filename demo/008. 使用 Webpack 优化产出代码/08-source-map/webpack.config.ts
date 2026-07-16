import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Source Map 优化演示
 *
 * 原理：Source Map 是一种映射关系文件，记录了压缩后代码与源码的对应关系，
 * 让浏览器在调试时能显示原始源码而非压缩后的代码。
 *
 * 生产环境 Source Map 策略需要权衡：
 * 1. 调试体验（能否准确定位源码）
 * 2. 安全性（是否暴露源码给用户）
 * 3. 构建速度和产物体积
 *
 * 常用 devtool 选项（从快到慢、从安全到暴露）：
 *
 * | devtool                  | 构建 | 重建  | 产物体积 | 安全性  | 适用场景           |
 * |--------------------------|------|-------|----------|---------|--------------------|
 * | false / (none)           | 最快 | -     | 最小     | 最安全  | 生产环境，无需调试  |
 * | hidden-source-map        | 慢   | -     | 辇大     | 较安全  | 生产，仅后端监控    |
 * | nosources-source-map     | 中   | -     | 中       | 中等    | 生产，仅看行列号    |
 * | source-map               | 慢   | -     | 最大     | 暴露源码| 开发环境           |
 * | cheap-source-map         | 快   | 快    | 中       | 暴露源码| 开发环境           |
 * | eval-cheap-source-map    | 最快 | 最快  | 小       | 暴露源码| 开发环境推荐       |
 * | hidden-nosources-cheap-source-map | 快 | -  | 较小    | 较安全  | 生产推荐          |
 *
 * 对比命令：
 * - `npm run build`        -> nosources-source-map（生产推荐，不暴露源码内容）
 * - `npm run build:cheap`  -> cheap-source-map（开发友好，快速构建）
 * - `npm run build:source` -> source-map（完整 Source Map，暴露源码）
 * - `npm run build:none`   -> false（无 Source Map，最小产物）
 */
export default (_env: unknown, argv: Record<string, unknown>): Configuration => {
  let devtool: string | false = 'nosources-source-map'

  if (argv.cheapMap === true) {
    devtool = 'cheap-source-map'
  } else if (argv.sourceMap === true) {
    devtool = 'source-map'
  } else if (argv.noMap === true) {
    devtool = false
  }

  return {
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
    devtool,
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
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
  }
}
