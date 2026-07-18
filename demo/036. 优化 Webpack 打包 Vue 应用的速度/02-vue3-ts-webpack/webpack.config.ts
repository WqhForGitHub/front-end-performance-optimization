import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'

/**
 * Vue3 + TS + Webpack 打包速度优化演示
 *
 * 优化点：
 * 1. thread-loader：多进程并行处理 Babel/TS 转译
 * 2. cache-loader：缓存 loader 处理结果
 * 3. babel-loader cacheDirectory：Babel 缓存
 * 4. @babel/preset-typescript：用 Babel 转译 TS，跳过类型检查（tsc --noEmit 单独执行）
 * 5. TerserPlugin parallel：多进程并行压缩
 * 6. externals + CDN：大库走 CDN
 * 7. resolve.alias：缩短路径解析时间
 */
const config = (env: any, argv: any) => {
  const isProd = argv.mode === 'production'

  return {
    entry: './src/main.ts',
    output: {
      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.ts', '.js', '.vue', '.json'],
    },
    externals: isProd
      ? {
          vue: 'Vue',
        }
      : {},
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            'cache-loader',
            {
              loader: 'vue-loader',
              options: {
                reactivityTransform: true,
              },
            },
          ],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            'cache-loader',
            {
              loader: 'thread-loader',
              options: {
                workers: 2,
              },
            },
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: [
                  ['@babel/preset-env', { targets: { browsers: ['> 1%'] } }],
                  ['@babel/preset-typescript', { allExtensions: true, isTSX: false }],
                ],
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            'css-loader',
          ],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html',
        cdnVue: isProd
          ? '<script src="https://unpkg.com/vue@3.4.0/dist/vue.runtime.global.prod.js"></script>'
          : '',
      }),
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: '[name].[contenthash:8].css',
            }),
          ]
        : []),
    ] as any[],
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
        }),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    devServer: {
      static: path.resolve(__dirname, 'dist'),
      hot: true,
      port: 5304,
    },
    stats: {
      colors: true,
      modules: false,
      children: false,
    },
  } as Configuration
}

export default config
