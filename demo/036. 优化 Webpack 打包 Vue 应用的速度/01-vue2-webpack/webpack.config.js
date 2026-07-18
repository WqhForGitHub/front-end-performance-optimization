const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

/**
 * Vue2 + Webpack 打包速度优化演示
 *
 * 优化点：
 * 1. thread-loader：多进程并行处理 JS/Babel
 * 2. cache-loader：缓存 loader 处理结果，二次构建加速
 * 3. babel-loader options.cacheDirectory：Babel 缓存
 * 4. transpileOnly（vue-loader 15 已内置）：跳过 TS 类型检查
 * 5. TerserPlugin parallel：多进程压缩
 * 6. externals：把 Vue 等大库走 CDN，不打包进 bundle
 * 7. aliases：缩短路径解析时间
 */
module.exports = (env, argv) => {
  const isProd = argv.mode === 'production'

  return {
    entry: './src/main.js',
    output: {
      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.runtime.esm.js',
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.vue', '.json'],
    },
    // 把 vue 走 CDN，不打包，加快构建速度
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
                compilerOptions: {
                  preserveWhitespace: false,
                },
              },
            },
          ],
        },
        {
          test: /\.js$/,
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
                presets: ['@babel/preset-env'],
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
        // 生产环境注入 CDN 的 Vue
        cdnVue: isProd
          ? '<script src="https://unpkg.com/vue@2.7.16/dist/vue.runtime.min.js"></script>'
          : '',
      }),
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: '[name].[contenthash:8].css',
            }),
          ]
        : []),
    ],
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
      port: 5303,
    },
    stats: {
      colors: true,
      modules: false,
      children: false,
    },
  }
}
