/**
 * 常量定义模块
 */

export const APP_NAME = 'resolve 优化示例'

export const MAX_ITEMS = 5

export const MODE = 'production' as const

export interface AppConfig {
  name: string
  maxItems: number
  mode: 'production' | 'development'
}

export const config: AppConfig = {
  name: APP_NAME,
  maxItems: MAX_ITEMS,
  mode: MODE
}
