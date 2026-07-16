/**
 * 多环境构建演示（函数式 webpack 配置 + --env 参数）
 *
 * 原理：
 *   webpack.config.ts 可以导出一个函数，签名为：
 *     (env: Record<string, unknown>, argv: Record<string, unknown>) => Configuration
 *
 *   `env` 对应命令行 `--env xxx=yyy` 传入的参数。
 *   我们据此生成不同的 Configuration，从而产出"功能子集"不同的 bundle。
 *
 * 本示例定义三个版本：
 *   - basic：只包含 basic 模块（最小体积）
 *   - full：包含 basic + advanced 模块（标准版）
 *   - premium：包含 basic + advanced + premium 模块（旗舰版）
 *
 * 对应 npm 脚本：
 *   npm run build:basic
 *   npm run build:full
 *   npm run build:premium
 *
 * 对比三个产物体积即可看到按需打包的效果。
 */
import path from 'path'
import webpack, { Configuration, DefinePlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

// 版本类型
type Edition = 'basic' | 'full' | 'premium'

/**
 * 函数式配置：第一个参数是 --env 传入的对象
 *   --env edition=basic  -> { edition: 'basic' }
 *   --env edition=full   -> { edition: 'full' }
 */
export default function configFactory(
  env: Record<string, unknown>,
  argv: Record<string, unknown>
): Configuration {
  // 读取版本，默认 basic
  const edition: Edition = (env.edition as Edition) || 'basic'
  const mode = (argv.mode as string) || 'development'

  // 根据版本决定哪些功能可用
  const flags = {
    INCLUDE_BASIC: true, // basic 总是包含
    INCLUDE_ADVANCED: edition === 'full' || edition === 'premium',
    INCLUDE_PREMIUM: edition === 'premium',
  }

  return {
    mode,
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `bundle.${edition}.js`,
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
        // 不同版本生成不同文件名，便于对比
        filename: `index.${edition}.html`,
      }),

      /**
       * 把版本开关注入到代码里，index.ts 用 if (process.env.XXX) 控制加载。
       * 配合 Terser 死代码消除，未开启的模块不会进入产物。
       */
      new DefinePlugin({
        'process.env.EDITION': JSON.stringify(edition),
        'process.env.INCLUDE_BASIC': JSON.stringify(flags.INCLUDE_BASIC),
        'process.env.INCLUDE_ADVANCED': JSON.stringify(flags.INCLUDE_ADVANCED),
        'process.env.INCLUDE_PREMIUM': JSON.stringify(flags.INCLUDE_PREMIUM),
      }),
    ],
    optimization: {
      usedExports: true,
    },
  }
}
