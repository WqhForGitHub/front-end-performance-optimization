/**
 * config/prod.ts -- 生产环境配置实现
 *
 * 当 NODE_ENV === 'production' 时，NormalModuleReplacementPlugin 会把
 * `import config from './config'` 重定向到本文件。
 *
 * 特点：
 *   - 线上 API 地址
 *   - 关闭调试日志（减少产物体积、避免泄漏）
 *   - 开启埋点上报
 */
import type { AppConfig } from './index'

const config: AppConfig = {
  apiBaseUrl: 'https://api.example.com',
  debug: false,
  analytics: true,
  env: 'prod',
}

export default config
