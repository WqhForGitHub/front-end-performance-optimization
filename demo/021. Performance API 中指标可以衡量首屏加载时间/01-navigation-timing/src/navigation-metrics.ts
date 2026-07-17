/**
 * Navigation Timing 指标采集模块
 *
 * 通过 performance.getEntriesByType('navigation') 获取 PerformanceNavigationTiming，
 * 拆解出各个阶段耗时，并计算 FP / FCP / TTFB / TTI / DOM Complete / Load 等关键首屏指标。
 */

export type Rating = 'good' | 'needs-improvement' | 'poor'

/** 单个加载阶段（用于时间线可视化） */
export interface NavigationPhase {
  /** 阶段标识 */
  name: string
  /** 展示名称 */
  label: string
  /** 阶段说明 */
  description: string
  /** 起始时间（相对 navigationStart，单位 ms） */
  start: number
  /** 结束时间 */
  end: number
  /** 阶段耗时 */
  duration: number
  /** 可视化颜色 */
  color: string
}

/** 关键首屏指标卡片 */
export interface NavigationKeyMetric {
  key: string
  label: string
  value: number
  unit: 'ms'
  description: string
  rating: Rating
}

/** 原始 Navigation Timing 时间戳集合 */
export type RawNavigationEntry = Record<string, number | string>

export interface CollectedMetrics {
  phases: NavigationPhase[]
  keyMetrics: NavigationKeyMetric[]
  rawEntry: RawNavigationEntry
  /** 整体 loadEventEnd - startTime */
  totalDuration: number
}

function rate(value: number, good: number, poor: number): Rating {
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

/**
 * 把 PerformanceNavigationTiming 拆解为可视化阶段。
 *
 * 阶段顺序参考 W3C Navigation Timing Level 2 规范：
 *   startTime -> redirectStart/End -> fetchStart ->
 *   domainLookupStart/End -> connectStart/End -> secureConnectionStart ->
 *   requestStart -> responseStart -> responseEnd ->
 *   domInteractive -> domContentLoadedEventStart/End -> domComplete ->
 *   loadEventStart/End
 */
export function collectNavigationMetrics(nav: PerformanceNavigationTiming): CollectedMetrics {
  // 安全握手起点：secureConnectionStart 为 0 表示未使用 HTTPS（或被复用）
  const sslStart = nav.secureConnectionStart > 0 ? nav.secureConnectionStart : nav.connectStart

  const phases: NavigationPhase[] = [
    {
      name: 'redirect',
      label: 'Redirect',
      description: '重定向耗时（含 HTTP 跳转）',
      start: nav.startTime,
      end: nav.fetchStart,
      duration: Math.max(0, nav.fetchStart - nav.startTime),
      color: '#9e9e9e',
    },
    {
      name: 'dns',
      label: 'DNS',
      description: 'DNS 解析耗时',
      start: nav.domainLookupStart,
      end: nav.domainLookupEnd,
      duration: Math.max(0, nav.domainLookupEnd - nav.domainLookupStart),
      color: '#4caf50',
    },
    {
      name: 'tcp',
      label: 'TCP',
      description: 'TCP 连接耗时',
      start: nav.connectStart,
      end: nav.connectEnd,
      duration: Math.max(0, nav.connectEnd - nav.connectStart),
      color: '#2196f3',
    },
    {
      name: 'ssl',
      label: 'SSL',
      description: 'TLS 安全握手耗时（含在 TCP 阶段内）',
      start: sslStart,
      end: nav.connectEnd,
      duration: Math.max(0, nav.connectEnd - sslStart),
      color: '#00bcd4',
    },
    {
      name: 'ttfb',
      label: 'TTFB',
      description: '请求发出 -> 首字节到达（Time To First Byte）',
      start: nav.requestStart,
      end: nav.responseStart,
      duration: Math.max(0, nav.responseStart - nav.requestStart),
      color: '#ff9800',
    },
    {
      name: 'response',
      label: 'Response',
      description: '响应内容下载耗时（responseStart -> responseEnd）',
      start: nav.responseStart,
      end: nav.responseEnd,
      duration: Math.max(0, nav.responseEnd - nav.responseStart),
      color: '#ff5722',
    },
    {
      name: 'dom-parsing',
      label: 'DOM Parsing',
      description: 'HTML 解析为 DOM 树（responseEnd -> domInteractive）',
      start: nav.responseEnd,
      end: nav.domInteractive,
      duration: Math.max(0, nav.domInteractive - nav.responseEnd),
      color: '#9c27b0',
    },
    {
      name: 'dcl',
      label: 'DCL',
      description: 'DOMContentLoaded 事件回调耗时',
      start: nav.domContentLoadedEventStart,
      end: nav.domContentLoadedEventEnd,
      duration: Math.max(0, nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart),
      color: '#673ab7',
    },
    {
      name: 'dom-complete',
      label: 'DOM Complete',
      description: 'domInteractive -> domComplete（含同步资源加载）',
      start: nav.domInteractive,
      end: nav.domComplete,
      duration: Math.max(0, nav.domComplete - nav.domInteractive),
      color: '#3f51b5',
    },
    {
      name: 'load-event',
      label: 'Load Event',
      description: 'window.onload 回调耗时',
      start: nav.loadEventStart,
      end: nav.loadEventEnd,
      duration: Math.max(0, nav.loadEventEnd - nav.loadEventStart),
      color: '#e91e63',
    },
  ]

  // 从 Paint Timing API 取 FP / FCP（与 Navigation Timing 互补）
  const paintEntries = performance.getEntriesByType('paint')
  const fp = paintEntries.find((e) => e.name === 'first-paint')?.startTime ?? 0
  const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime ?? 0

  const ttfb = Math.max(0, nav.responseStart - nav.requestStart)
  // TTI 精确计算需要 Long Task + 主线程空闲探测，这里以 domInteractive 近似
  const tti = nav.domInteractive
  const domComplete = Math.max(0, nav.domComplete)
  const load = Math.max(0, nav.loadEventEnd)

  const keyMetrics: NavigationKeyMetric[] = [
    {
      key: 'fp',
      label: 'FP 首次绘制',
      value: fp,
      unit: 'ms',
      description: '浏览器首次渲染任何像素（背景色等）',
      rating: rate(fp, 1500, 3000),
    },
    {
      key: 'fcp',
      label: 'FCP 首次内容绘制',
      value: fcp,
      unit: 'ms',
      description: '浏览器首次渲染文本/图像/SVG/Canvas 等内容',
      rating: rate(fcp, 1800, 3000),
    },
    {
      key: 'ttfb',
      label: 'TTFB 首字节时间',
      value: ttfb,
      unit: 'ms',
      description: '请求发出到收到第一个字节',
      rating: rate(ttfb, 800, 1800),
    },
    {
      key: 'tti',
      label: 'TTI 可交互时间',
      value: tti,
      unit: 'ms',
      description: '页面可响应用户输入（这里近似为 domInteractive）',
      rating: rate(tti, 3800, 7300),
    },
    {
      key: 'dom-complete',
      label: 'DOM Complete',
      value: domComplete,
      unit: 'ms',
      description: 'DOM 解析 + 同步资源加载完成',
      rating: rate(domComplete, 3000, 5000),
    },
    {
      key: 'load',
      label: 'Load 页面完全加载',
      value: load,
      unit: 'ms',
      description: '从开始到 load 事件结束（含所有资源）',
      rating: rate(load, 3000, 5000),
    },
  ]

  const rawEntry: RawNavigationEntry = {
    name: nav.name,
    entryType: nav.entryType,
    type: nav.type,
    redirectCount: nav.redirectCount,
    startTime: nav.startTime,
    redirectStart: nav.redirectStart,
    redirectEnd: nav.redirectEnd,
    fetchStart: nav.fetchStart,
    domainLookupStart: nav.domainLookupStart,
    domainLookupEnd: nav.domainLookupEnd,
    connectStart: nav.connectStart,
    connectEnd: nav.connectEnd,
    secureConnectionStart: nav.secureConnectionStart,
    requestStart: nav.requestStart,
    responseStart: nav.responseStart,
    responseEnd: nav.responseEnd,
    domInteractive: nav.domInteractive,
    domContentLoadedEventStart: nav.domContentLoadedEventStart,
    domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
    domComplete: nav.domComplete,
    loadEventStart: nav.loadEventStart,
    loadEventEnd: nav.loadEventEnd,
    transferSize: nav.transferSize,
    encodedBodySize: nav.encodedBodySize,
    decodedBodySize: nav.decodedBodySize,
  }

  return {
    phases,
    keyMetrics,
    rawEntry,
    totalDuration: load,
  }
}
