import { Configuration } from 'webpack'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { ManifestPlugin } from './src/manifest-plugin'

/**
 * 基于资源清单（manifest）的 LocalStorage 缓存 -- 演示
 *
 * 思路：
 *   1. 通过自定义 ManifestPlugin 在构建产物中生成 manifest.json，
 *      记录每个 JS/CSS 资源名 + contenthash。
 *   2. 运行时 CacheManager 先拉取 manifest.json，再决定每个资源
 *      是命中 LocalStorage 缓存，还是需要重新拉取并写入。
 *   3. 文件名带 contenthash，资源变更时 hash 自然变化，
 *      缓存校验以 manifest 中的 hash 为准。
 *
 * 观察方式：
 *   - npm run build 后，dist/ 下会出现 manifest.json
 *   - 通过任意静态服务器（如 npx serve dist）打开页面，
 *     首次全部 MISS；刷新后应全部 HIT
 */
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'js/bundle.[contenthash:8].js',
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
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    // 自定义插件：生成 manifest.json 资源清单
    new ManifestPlugin(),
  ],
}

export default config
