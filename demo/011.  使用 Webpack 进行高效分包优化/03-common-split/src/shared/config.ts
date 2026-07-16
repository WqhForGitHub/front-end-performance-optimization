/**
 * 共享配置模块
 *
 * 被 pageA 和 pageB 同时引用，
 * 会被 splitChunks 提取到 common chunk 中。
 */

/** 应用全局配置 */
export const APP_CONFIG = {
  name: '分包优化演示',
  version: '1.0.0',
  apiUrl: 'https://api.example.com',
  timeout: 5000
}

/** 页面元信息接口 */
export interface PageMeta {
  title: string
  description: string
}

/** 各页面的元信息 */
export const PAGE_META: Record<string, PageMeta> = {
  pageA: {
    title: '页面 A',
    description: '这是页面 A 的描述信息，展示公共模块提取效果。'
  },
  pageB: {
    title: '页面 B',
    description: '这是页面 B 的描述信息，与页面 A 共享同一套模块。'
  }
}

/** 获取指定页面的元信息 */
export function getPageMeta(page: string): PageMeta {
  return PAGE_META[page] ?? { title: '未知页面', description: '未找到该页面的元信息。' }
}
