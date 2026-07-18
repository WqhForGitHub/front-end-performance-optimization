/**
 * 资源加载优化技术定义
 */
export interface Technique {
  /** rel 属性值 */
  rel: string
  /** 中文名称 */
  name: string
  /** 用途说明 */
  purpose: string
  /** 适用场景 */
  scenario: string
  /** 示例 link 标签 HTML */
  example: string
  /** 主题色 */
  color: string
  /** 图标符号 */
  icon: string
}

export const techniques: Technique[] = [
  {
    rel: 'preload',
    name: '预加载（preload）',
    purpose: '提前加载当前页面关键资源（字体、CSS、关键 JS、首屏图片），强制浏览器尽早请求。',
    scenario: '首屏关键资源：本页一定会用到、但对渲染至关重要的资源。',
    example:
      '<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>',
    color: '#1976d2',
    icon: 'P',
  },
  {
    rel: 'prefetch',
    name: '预获取（prefetch）',
    purpose: '在浏览器空闲时预取下一个页面可能需要的资源，缓存起来供将来导航使用。',
    scenario: '下一个可能访问的页面资源，如路由分包、下一页图片。',
    example: '<link rel="prefetch" href="/next-page.chunk.js" as="script">',
    color: '#4caf50',
    icon: 'F',
  },
  {
    rel: 'dns-prefetch',
    name: 'DNS 预解析（dns-prefetch）',
    purpose: '提前完成 DNS 解析，减少后续请求的 DNS 查询耗时。',
    scenario: '即将请求的第三方域名，如 CDN、统计服务、图片服务器。',
    example: '<link rel="dns-prefetch" href="//cdn.example.com">',
    color: '#ff9800',
    icon: 'D',
  },
  {
    rel: 'preconnect',
    name: '预连接（preconnect）',
    purpose: '提前完成 DNS + TCP + TLS 握手，建立完整连接，减少首字节时间（TTFB）。',
    scenario: '关键第三方源，如字体服务、API 服务器。',
    example: '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
    color: '#9c27b0',
    icon: 'C',
  },
]

/**
 * 资源加载时间线阶段
 */
export interface TimelineStage {
  /** 阶段名称 */
  name: string
  /** 起始时间（ms） */
  start: number
  /** 持续时间（ms） */
  duration: number
  /** 颜色 */
  color: string
  /** 说明 */
  note: string
}

/**
 * 不使用预连接的加载时间线
 */
export const withoutPreconnectTimeline: TimelineStage[] = [
  { name: 'DNS 解析', start: 0, duration: 80, color: '#ff9800', note: '查询第三方域名 IP' },
  { name: 'TCP 连接', start: 80, duration: 60, color: '#f44336', note: '三次握手' },
  { name: 'TLS 握手', start: 140, duration: 90, color: '#e91e63', note: 'HTTPS 安全连接' },
  { name: '请求 / 响应', start: 230, duration: 120, color: '#1976d2', note: '发送请求并下载资源' },
]

/**
 * 使用 preconnect 后的加载时间线
 */
export const withPreconnectTimeline: TimelineStage[] = [
  { name: 'DNS 解析', start: 0, duration: 80, color: '#ff9800', note: '在页面解析时并行完成' },
  { name: 'TCP 连接', start: 0, duration: 60, color: '#f44336', note: '与 DNS 并行' },
  { name: 'TLS 握手', start: 0, duration: 90, color: '#e91e63', note: '与 DNS 并行' },
  { name: '请求 / 响应', start: 90, duration: 120, color: '#4caf50', note: '连接已就绪，直接请求' },
]

/**
 * 不使用 preload 的关键字体加载流程
 */
export const withoutPreloadTimeline: TimelineStage[] = [
  { name: 'HTML 解析', start: 0, duration: 100, color: '#1976d2', note: '解析 DOM' },
  { name: 'CSS 解析', start: 100, duration: 80, color: '#9c27b0', note: '发现 @font-face' },
  { name: '字体下载', start: 180, duration: 200, color: '#f44336', note: '阻塞渲染，文字闪动' },
  { name: '内容渲染', start: 380, duration: 60, color: '#4caf50', note: '最终渲染' },
]

/**
 * 使用 preload 的关键字体加载流程
 */
export const withPreloadTimeline: TimelineStage[] = [
  { name: 'HTML 解析', start: 0, duration: 100, color: '#1976d2', note: '解析 DOM' },
  { name: '字体下载', start: 0, duration: 200, color: '#4caf50', note: '与 HTML 解析并行预加载' },
  { name: 'CSS 解析', start: 100, duration: 80, color: '#9c27b0', note: '字体已下载完毕' },
  { name: '内容渲染', start: 180, duration: 60, color: '#4caf50', note: '提前渲染' },
]
