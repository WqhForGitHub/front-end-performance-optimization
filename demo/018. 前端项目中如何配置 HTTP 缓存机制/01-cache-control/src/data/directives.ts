/**
 * Cache-Control 指令数据定义
 * 每个 directive 描述一个 Cache-Control 响应头中的指令
 */

export interface DirectiveInfo {
  /** 指令名称 */
  name: string
  /** 指令取值，如 max-age 需要一个秒数 */
  value?: string
  /** 中文说明 */
  description: string
  /** 适用场景示例 */
  example: string
  /** 是否可缓存标志，用于决策流程图分类 */
  category: 'freshness' | 'cacheability' | 'revalidation' | 'misc'
  /** 是否是请求方向（请求头）也支持 */
  requestSide: boolean
}

export const directives: DirectiveInfo[] = [
  {
    name: 'max-age',
    value: '<seconds>',
    description: '设置资源在浏览器缓存中的最大存活时间（秒）。超过该时间视为过期。',
    example: 'max-age=31536000  // 一年',
    category: 'freshness',
    requestSide: false
  },
  {
    name: 's-maxage',
    value: '<seconds>',
    description: '专用于共享缓存（CDN / 代理）的最大存活时间，会覆盖 max-age。',
    example: 's-maxage=600, max-age=60',
    category: 'freshness',
    requestSide: false
  },
  {
    name: 'no-cache',
    value: '',
    description: '不是“不缓存”，而是“每次使用前必须向服务器校验（协商缓存）”。命中后仍走 304 流程。',
    example: 'no-cache  // 配合 ETag 使用',
    category: 'revalidation',
    requestSide: true
  },
  {
    name: 'no-store',
    value: '',
    description: '真正禁止缓存：请求和响应都不允许存储在缓存中。最严格的禁缓存指令。',
    example: 'no-store  // 敏感数据',
    category: 'cacheability',
    requestSide: true
  },
  {
    name: 'public',
    value: '',
    description: '允许任何缓存（浏览器、CDN、代理）存储响应，即使带 Authorization 也可缓存。',
    example: 'public, max-age=3600',
    category: 'cacheability',
    requestSide: false
  },
  {
    name: 'private',
    value: '',
    description: '只允许浏览器缓存，禁止共享缓存（CDN）存储。常用于用户私人数据。',
    example: 'private, max-age=300',
    category: 'cacheability',
    requestSide: false
  },
  {
    name: 'immutable',
    value: '',
    description: '表示资源永远不会改变，浏览器在存活期内即使刷新也不会发协商请求。',
    example: 'max-age=31536000, immutable',
    category: 'misc',
    requestSide: false
  },
  {
    name: 'must-revalidate',
    value: '',
    description: '资源过期后必须向源服务器校验，不允许在无法连接时使用过期副本。',
    example: 'max-age=60, must-revalidate',
    category: 'revalidation',
    requestSide: false
  },
  {
    name: 'proxy-revalidate',
    value: '',
    description: '类似 must-revalidate，但只对共享缓存（代理/CDN）生效。',
    example: 's-maxage=60, proxy-revalidate',
    category: 'revalidation',
    requestSide: false
  },
  {
    name: 'no-transform',
    value: '',
    description: '禁止中间代理对资源做转换（如压缩图片、转码），保证内容原样到达。',
    example: 'no-transform',
    category: 'misc',
    requestSide: true
  },
  {
    name: 'stale-while-revalidate',
    value: '<seconds>',
    description: '允许在过期后的一段时间内先返回旧副本，同时后台异步校验更新。',
    example: 'max-age=60, stale-while-revalidate=600',
    category: 'freshness',
    requestSide: false
  },
  {
    name: 'stale-if-error',
    value: '<seconds>',
    description: '当源服务器出错（5xx）时，允许在指定时间内继续使用过期副本。',
    example: 'max-age=60, stale-if-error=86400',
    category: 'freshness',
    requestSide: false
  }
]

/** 常见资源类型的推荐缓存配置 */
export interface PresetConfig {
  resource: string
  cacheControl: string
  reason: string
  color: string
}

export const presets: PresetConfig[] = [
  {
    resource: '带 hash 的 JS / CSS',
    cacheControl: 'public, max-age=31536000, immutable',
    reason: '文件名含 hash，内容变更即换名，可永久强缓存',
    color: '#16a34a'
  },
  {
    resource: 'HTML 文档',
    cacheControl: 'no-cache',
    reason: '入口文件，必须每次校验，确保用户拿到最新版本引用',
    color: '#2563eb'
  },
  {
    resource: '用户私人数据 API',
    cacheControl: 'private, no-store',
    reason: '敏感信息，禁止任何缓存存储',
    color: '#dc2626'
  },
  {
    resource: '公开图片 / 字体',
    cacheControl: 'public, max-age=86400',
    reason: '不常变动，缓存一天减少回源',
    color: '#9333ea'
  },
  {
    resource: '频繁更新列表 API',
    cacheControl: 'public, max-age=0, must-revalidate',
    reason: '总是拿最新，但允许协商缓存减少传输',
    color: '#ea580c'
  }
]

/** 缓存决策流程图节点 */
export interface FlowNode {
  id: string
  label: string
  type: 'start' | 'decision' | 'action' | 'end-hit' | 'end-miss'
  note?: string
}

export const flowSteps: FlowNode[] = [
  { id: 'req', label: '发起请求', type: 'start', note: '用户访问 URL / 刷新页面' },
  { id: 'store', label: '本地是否有缓存副本?', type: 'decision' },
  { id: 'noStore', label: 'no-store?', type: 'decision', note: '检查响应头是否禁止缓存' },
  { id: 'fresh', label: '是否在 max-age 内 (未过期)?', type: 'decision' },
  { id: 'immutable', label: 'immutable 且未过期?', type: 'decision', note: '强刷新也不会发请求' },
  { id: 'hit', label: '命中强缓存 200 (from disk/memory cache)', type: 'end-hit' },
  { id: 'revalidate', label: '发协商请求 (If-None-Match / If-Modified-Since)', type: 'action' },
  { id: '304', label: '服务器返回 304?', type: 'decision' },
  { id: 'use304', label: '使用本地副本 (协商命中)', type: 'end-hit' },
  { id: 'fetch', label: '完整请求，下载新资源 200', type: 'end-miss' }
]
