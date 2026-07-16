import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/**
 * Runtime Chunk（运行时代码分离）演示
 *
 * 原理：webpack 在每个 bundle 中都会注入一段运行时代码（runtime），
 * 包含模块加载器、模块映射表等。这段代码会随着模块关系的变化而变化，
 * 即使业务代码没改，只要增删了一个模块，runtime 就会变，
 * 导致 contenthash 更新，进而使整个 bundle 缓存失效。
 *
 * 通过 `optimization.runtimeChunk` 将 runtime 单独提取为一个 chunk，
 * 业务代码和运行时代码分离，这样：
 * - 业务代码修改不影响 runtime chunk 的 hash
 * - runtime chunk 修改不影响业务代码的 hash
 * - 配合 splitChunks，实现最优的缓存命中率
 *
 * 配置选项：
 * - runtimeChunk: 'single'  -> 所有入口共享一个 runtime chunk
 * - runtimeChunk: 'multiple' -> 每个入口一个 runtime chunk
 * - runtimeChunk: { name: 'runtime' } -> 自定义名称
 *
 * 对比：
 * - `npm run build`            -> 分离 runtime，查看 dist 中的 runtime.*.js
 * - `npm run build:no-runtime` -> 不分离，runtime 内联在 bundle 中
 */
export default (_env: unknown, argv: Record<string, unknown>): Configuration => {
  const noRuntime = argv.noRuntime === true

  const config: Configuration = {
    mode: 'production',
    entry: {
      main: './src/index.ts',
    },
    output: {
      filename: '[name].[contenthash:8].js',
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
      // 将 runtime 代码提取为单独的 chunk（noRuntime 时为 undefined）
      runtimeChunk: noRuntime ? undefined : 'single',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
    ],
  }

  return config
}
