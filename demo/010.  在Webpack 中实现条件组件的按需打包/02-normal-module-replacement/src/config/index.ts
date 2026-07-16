/**
 * config/index.ts -- 配置入口（被 NormalModuleReplacementPlugin 替换）
 *
 * 重要：
 *   这个文件本身几乎不会被 webpack 打包到产物中，
 *   因为 webpack.config.ts 里的 NormalModuleReplacementPlugin 会把
 *   所有 `./config` 请求替换成 `./config.dev` 或 `./config.prod`。
 *
 *   它存在的意义：
 *     1. 作为 TypeScript 的"类型契约"，约束 dev/prod 两个实现文件的结构一致。
 *     2. 给 IDE / tsc 提供类型提示，让 `import config from './config'` 不报错。
 *     3. 作为 fallback：万一没有触发替换（例如配置写错），也能有一个默认实现。
 */

export interface AppConfig {
  /** API 基础地址 */
  apiBaseUrl: string
  /** 是否开启调试日志 */
  debug: boolean
  /** 是否启用埋点上报 */
  analytics: boolean
  /** 环境名称 */
  env: 'dev' | 'prod' | 'fallback'
}

const config: AppConfig = {
  apiBaseUrl: 'http://localhost:3000',
  debug: true,
  analytics: false,
  env: 'fallback',
}

export default config
