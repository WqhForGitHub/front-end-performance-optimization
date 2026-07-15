import type { NavPhase, PerformanceMetric } from './types'

/**
 * Navigation Timing API
 * 通过 performance.getEntriesByType('navigation') 获取页面加载的详细计时信息
 *
 * 核心时间线（按顺序）:
 *   navigationStart → fetchStart → domainLookupStart → domainLookupEnd
 *   → connectStart → secureConnectionStart → connectEnd
 *   → requestStart → responseStart → responseEnd
 *   → domLoading → domInteractive → domContentLoadedEventStart
 *   → domContentLoadedEventEnd → domComplete
 *   → loadEventStart → loadEventEnd
 */

/** domLoading 在 Level 2 规范中被废弃，但浏览器仍支持，TS 类型已移除 */
interface ExtendedNavTiming extends PerformanceNavigationTiming {
  domLoading?: number
}

/** 获取 Navigation Timing 条目 */
export function getNavigationTiming(): ExtendedNavTiming | null {
  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return entries.length > 0 ? (entries[0] as ExtendedNavTiming) : null
}

/**
 * 计算各阶段的耗时
 * 返回有序的阶段列表，用于时间线可视化
 */
export function getNavigationPhases(): NavPhase[] {
  const nav = getNavigationTiming()
  if (!nav) return []

  const phases: NavPhase[] = [
    {
      label: 'DNS 查询',
      start: nav.domainLookupStart,
      end: nav.domainLookupEnd,
      duration: nav.domainLookupEnd - nav.domainLookupStart,
      color: '#4caf50',
      desc: '域名解析耗时。本地有缓存时通常为 0',
    },
    {
      label: 'TCP 连接',
      start: nav.connectStart,
      end: nav.connectEnd,
      duration: nav.connectEnd - nav.connectStart,
      color: '#2196f3',
      desc: 'TCP 三次握手耗时（含 SSL/TLS 握手）',
    },
    {
      label: 'SSL 握手',
      start: nav.secureConnectionStart || nav.connectStart,
      end: nav.connectEnd,
      duration: nav.secureConnectionStart ? nav.connectEnd - nav.secureConnectionStart : 0,
      color: '#9c27b0',
      desc: 'HTTPS 安全连接握手耗时',
    },
    {
      label: '请求发送',
      start: nav.requestStart,
      end: nav.responseStart,
      duration: nav.responseStart - nav.requestStart,
      color: '#ff9800',
      desc: 'TTFB（Time to First Byte）= 请求发出到收到第一个字节的时间',
    },
    {
      label: '响应下载',
      start: nav.responseStart,
      end: nav.responseEnd,
      duration: nav.responseEnd - nav.responseStart,
      color: '#f44336',
      desc: '服务器响应内容下载耗时',
    },
    {
      label: 'DOM 解析',
      start: nav.domLoading || nav.responseEnd,
      end: nav.domInteractive,
      duration: nav.domInteractive - (nav.domLoading || nav.responseEnd),
      color: '#00bcd4',
      desc: 'HTML 解析为 DOM 树的耗时',
    },
    {
      label: 'DOMContentLoaded',
      start: nav.domContentLoadedEventStart,
      end: nav.domContentLoadedEventEnd,
      duration: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      color: '#795548',
      desc: 'DOMContentLoaded 事件执行耗时',
    },
    {
      label: '资源加载',
      start: nav.domInteractive,
      end: nav.domComplete,
      duration: nav.domComplete - nav.domInteractive,
      color: '#607d8b',
      desc: '同步资源（图片、样式等）加载耗时',
    },
    {
      label: 'load 事件',
      start: nav.loadEventStart,
      end: nav.loadEventEnd,
      duration: nav.loadEventEnd - nav.loadEventStart,
      color: '#e91e63',
      desc: 'window.onload 回调执行耗时',
    },
  ]

  return phases.filter((p) => p.duration > 0 || p.label === 'DNS 查询')
}

/**
 * 计算首屏加载相关的关键性能指标
 */
export function getKeyMetrics(): PerformanceMetric[] {
  const nav = getNavigationTiming()
  if (!nav) return []

  const metrics: PerformanceMetric[] = []

  // 1. TTFB（首字节时间）
  const ttfb = nav.responseStart - nav.startTime
  metrics.push({
    name: 'TTFB',
    label: '首字节时间 (TTFB)',
    value: ttfb,
    unit: 'ms',
    desc: '从导航开始到收到服务器第一个字节的时间',
    rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
  })

  // 2. DNS 查询时间
  const dns = nav.domainLookupEnd - nav.domainLookupStart
  metrics.push({
    name: 'DNS',
    label: 'DNS 查询',
    value: dns,
    unit: 'ms',
    desc: '域名解析耗时',
    rating: dns < 50 ? 'good' : dns < 200 ? 'needs-improvement' : 'poor',
  })

  // 3. TCP 连接时间
  const tcp = nav.connectEnd - nav.connectStart
  metrics.push({
    name: 'TCP',
    label: 'TCP 连接',
    value: tcp,
    unit: 'ms',
    desc: 'TCP 连接（含 SSL）耗时',
    rating: tcp < 100 ? 'good' : tcp < 500 ? 'needs-improvement' : 'poor',
  })

  // 4. 请求响应时间
  const requestTime = nav.responseEnd - nav.requestStart
  metrics.push({
    name: 'Request',
    label: '请求响应',
    value: requestTime,
    unit: 'ms',
    desc: '从发送请求到接收完整响应的时间',
    rating: requestTime < 1000 ? 'good' : requestTime < 3000 ? 'needs-improvement' : 'poor',
  })

  // 5. DOM 解析时间
  const domParse = nav.domInteractive - (nav.domLoading || nav.responseEnd)
  metrics.push({
    name: 'DOMParse',
    label: 'DOM 解析',
    value: domParse,
    unit: 'ms',
    desc: 'HTML 解析为 DOM 树的耗时',
    rating: domParse < 500 ? 'good' : domParse < 2000 ? 'needs-improvement' : 'poor',
  })

  // 6. DCL（DOMContentLoaded 时间）
  const dcl = nav.domContentLoadedEventEnd - nav.startTime
  metrics.push({
    name: 'DCL',
    label: 'DOMContentLoaded',
    value: dcl,
    unit: 'ms',
    desc: '从导航开始到 DOMContentLoaded 事件结束的时间（首屏可用的重要指标）',
    rating: dcl < 1500 ? 'good' : dcl < 3000 ? 'needs-improvement' : 'poor',
  })

  // 7. 页面完全加载时间
  const loadComplete = nav.loadEventEnd - nav.startTime
  metrics.push({
    name: 'LoadComplete',
    label: '页面完全加载',
    value: loadComplete,
    unit: 'ms',
    desc: '从导航开始到 load 事件结束的完整时间',
    rating: loadComplete < 3000 ? 'good' : loadComplete < 6000 ? 'needs-improvement' : 'poor',
  })

  // 8. 首屏时间估算（DOM 解析完成时间）
  const firstScreen = nav.domInteractive - nav.startTime
  metrics.push({
    name: 'FirstScreen',
    label: '首屏时间（估算）',
    value: firstScreen,
    unit: 'ms',
    desc: 'domInteractive - navigationStart，近似首屏可交互时间',
    rating: firstScreen < 1500 ? 'good' : firstScreen < 3000 ? 'needs-improvement' : 'poor',
  })

  return metrics
}
