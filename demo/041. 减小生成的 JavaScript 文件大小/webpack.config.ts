import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CompressionPlugin from 'compression-webpack-plugin'

/**
 * React + Webpack 减小 JS 文件大小优化配置
 *
 * 优化点：
 * 1. production 模式：自动开启 Tree Shaking
 * 2. TerserPlugin：压缩、混淆、移除注释
 * 3. splitChunks：分包，利用浏览器缓存
 * 4. externals + CDN：React 走 CDN，不打包进 bundle
 * 5. CompressionPlugin：Gzip 压缩
 * 6. @babel/preset-env + modules: false：让 Webpack 做 Tree Shaking
 * 7. sideEffects: false（package.json）：标记无副作用
 */
const config = (env: any, argv: any) => {
  const isProd = argv.mode === 'production'

  return {
    entry: './src/index.tsx',
    output: {
      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // 生产环境把 React 走 CDN
    externals: isProd
      ? {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      : {},
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                // modules: false 让 Webpack 做 Tree Shaking
                ['@babel/preset-env', { modules: false, targets: { browsers: ['> 1%'] } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        // 生产环境注入 CDN
        cdn: isProd
          ? `
            <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
          `
          : '',
      }),
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: '[name].[contenthash:8].css',
            }),
            new CompressionPlugin({
              algorithm: 'gzip',
              threshold: 10240,
              minRatio: 0.8,
            }),
            new CompressionPlugin({
              algorithm: 'brotliCompress',
              threshold: 10240,
              minRatio: 0.8,
            } as any),
          ]
        : []),
    ] as any[],
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true, // 移除 console
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info'],
            },
            format: {
              comments: false,
            },
            mangle: {
              safari10: true,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    devServer: {
      static: path.resolve(__dirname, 'dist'),
      hot: true,
      port: 5312,
    },
    stats: {
      colors: true,
      modules: false,
      children: false,
    },
  } as Configuration
}

export default config
