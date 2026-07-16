/**
 * config/dev.ts -- 开发环境配置实现
 *
 * 当 NODE_ENV !== 'production' 时，NormalModuleReplacementPlugin 会把
 * `import config from './config'` 重定向到本文件。
 *
 * 特点：
 *   - 本地 API 地址
 *   - 开启调试日志
 *   - 关闭埋点上报（开发期不想污染统计数据）
 */
import type { AppConfig } from './index'

const config: AppConfig = {
  apiBaseUrl: 'http://localhost:3000',
  debug: true,
  analytics: false,
  env: 'dev',
}

export default config
