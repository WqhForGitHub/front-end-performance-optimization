/**
 * 使用 NormalModuleReplacementPlugin 实现条件打包
 *
 * 原理：
 *   NormalModuleReplacementPlugin 会在 webpack 解析模块时，
 *   把"匹配某个正则"的 resource.request 替换成另一个字符串。
 *   利用这一点，可以让 `./config` 在不同环境下被替换为
 *   `./config.dev` 或 `./config.prod`，从而实现"按环境打包不同实现"。
 *
 * 与 DefinePlugin 的区别：
 *   - DefinePlugin 是"文本替换"，适合做开关 (true/false)。
 *   - NormalModuleReplacementPlugin 是"模块替换"，
 *     适合"同一个接口、不同实现"的场景，例如 dev/prod 配置、mock/真实数据。
 *
 * 资源对象（resource）常见字段：
 *   - request:      源码里写的导入字符串，如 './config'
 *   - context:      导入发生的目录（绝对路径）
 *   - contextInfo:  导入上下文信息（issuer 等）
 */
import path from 'path'
import webpack, { Configuration, NormalModuleReplacementPlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

// 当前构建环境：'development' | 'production'
// 实际项目里可以用 cross-env 注入 NODE_ENV，或用 --env 参数
const NODE_ENV: string = process.env.NODE_ENV || 'development'
const isProd: boolean = NODE_ENV === 'production'

const config: Configuration = {
  // mode 也会作为 argv 传给函数式配置
  mode: isProd ? 'production' : 'development',
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
     * 核心：把对 './config' 的请求替换成 './config.dev' 或 './config.prod'
     *
     * 正则 /\/config$/ 会匹配以 "/config" 结尾的请求；
     * 回调函数里修改 resource.request，让 webpack 解析到不同的真实文件。
     *
     * 注意：
     *   1. resource.request 是源码里写的导入字符串（不含扩展名）。
     *   2. 替换后 webpack 仍会按 resolve.extensions 补全扩展名。
     *   3. 这样 index.ts 里写 `import config from './config'`，
     *      实际打包时会指向 config.dev.ts 或 config.prod.ts。
     */
    new NormalModuleReplacementPlugin(/\/config$/, (resource: unknown) => {
      const res = resource as { request: string }
      // 根据环境替换为不同的实现文件
      res.request = isProd ? './config.prod' : './config.dev'
    }),
  ],
}

export default config
