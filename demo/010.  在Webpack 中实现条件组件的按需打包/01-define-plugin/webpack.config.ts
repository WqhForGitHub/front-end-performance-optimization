/**
 * 使用 DefinePlugin 实现条件打包
 *
 * 原理：
 *   DefinePlugin 会在编译阶段将源码中匹配的标识符替换为给定的值。
 *   我们可以用 `process.env.FEATURE_A` 这样的标识符作为"开关"，
 *   当其值为 `false` 时，相关分支会被 webpack 视为死代码（dead code），
 *   在压缩阶段被移除，从而实现"按需打包"。
 *
 * 关键点：
 *   1. DefinePlugin 做的是"文本替换"，不是运行时的变量赋值。
 *   2. 配合 Terser 等压缩工具，可以删除 if(false){...} 这类死代码。
 *   3. 必须使用 JSON.stringify() 包裹值，否则字符串会被当作代码表达式。
 */
import path from 'path'
import webpack, { Configuration, DefinePlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const config: Configuration = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),

    /**
     * 核心：通过 DefinePlugin 注入"功能开关"
     *
     * 修改下面的值并重新 build，可以看到 dist/bundle.js 的体积发生变化：
     *   - FEATURE_A=true / FEATURE_B=true  -> 对应模块会被打包
     *   - FEATURE_A=false / FEATURE_B=false -> 对应模块被当作死代码移除
     *
     * 实际项目中，这些值一般来自 CI 环境变量，例如：
     *   process.env.FEATURE_A ?? 'false'
     */
    new DefinePlugin({
      'process.env.FEATURE_A': JSON.stringify(true),
      'process.env.FEATURE_B': JSON.stringify(false),
      'process.env.FEATURE_C': JSON.stringify(true),
    }),
  ],

  /**
   * 开启压缩后，死代码（if (false) {...}）会被 Terser 移除。
   * 生产环境（mode: 'production'）默认开启。
   */
  optimization: {
    usedExports: true,
  },
}

export default config
