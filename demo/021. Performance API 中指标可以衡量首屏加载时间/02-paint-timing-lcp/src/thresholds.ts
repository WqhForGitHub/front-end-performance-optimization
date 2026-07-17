/**
 * 首屏相关指标的定义、阈值与采集 API
 *
 * 阈值参考 web.dev 与 Chrome UX 的官方建议：
 *   - FP/FCP: 良好 ≤ 1800ms，较差 > 3000ms
 *   - LCP:    良好 ≤ 2500ms，较差 > 4000ms
 *   - FMP:    良好 ≤ 2000ms，较差 > 4000ms（已废弃，仅保留概念）
 *   - TTI:    良好 ≤ 3800ms，较差 > 7300ms
 *   - TTFB:   良好 ≤ 800ms，较差 > 1800ms
 */

export type Rating = 'good' | 'needs-improvement' | 'poor'

export interface MetricDefinition {
  /** 缩写 */
  name: string
  /** 全称 */
  fullName: string
  /** 含义说明 */
  description: string
  /** 良好阈值（ms） */
  good: number
  /** 较差阈值（ms） */
  poor: number
  /** 采集该指标用到的 API */
  api: string
  /** 是否仍为推荐指标 */
  status: 'recommended' | 'deprecated' | 'complementary'
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    name: 'FP',
    fullName: 'First Paint（首次绘制）',
    description:
      '浏览器首次渲染任何像素（例如背景色）的时间点。属于 Paint Timing API。',
    good: 1500,
    poor: 3000,
    api: "performance.getEntriesByType('paint') -> name === 'first-paint'",
    status: 'complementary',
  },
  {
    name: 'FCP',
    fullName: 'First Contentful Paint（首次内容绘制）',
    description:
      '浏览器首次渲染任何文本、图像、SVG 或非空白 Canvas 的时间点，是核心 Web 指标之一。',
    good: 1800,
    poor: 3000,
    api: "performance.getEntriesByType('paint') -> name === 'first-contentful-paint'",
    status: 'recommended',
  },
  {
    name: 'LCP',
    fullName: 'Largest Contentful Paint（最大内容绘制）',
    description:
      '视口内最大的内容元素完成渲染的时间点，最能反映用户感知的首屏加载体验，是 Core Web Vitals 三大指标之一。',
    good: 2500,
    poor: 4000,
    api: "new PerformanceObserver({ type: 'largest-contentful-paint' })",
    status: 'recommended',
  },
  {
    name: 'FMP',
    fullName: 'First Meaningful Paint（首次有意义绘制）',
    description:
      '页面"主要内容"开始可见的时间。该指标定义模糊、难以稳定测量，Chrome 已于 2020 年废弃，官方推荐用 LCP 替代。',
    good: 2000,
    poor: 4000,
    api: '已废弃（原基于布局突变 + 文本权重启发式算法）',
    status: 'deprecated',
  },
  {
    name: 'TTI',
    fullName: 'Time to Interactive（可交互时间）',
    description:
      '页面可以可靠响应用户输入的时间点（主线程至少 5s 内没有超过 50ms 的长任务，且 FCP 已发生）。',
    good: 3800,
    poor: 7300,
    api: '需结合 PerformanceObserver({type:"longtask"}) 与 FCP 计算，无原生 API',
    status: 'complementary',
  },
  {
    name: 'TTFB',
    fullName: 'Time to First Byte（首字节时间）',
    description:
      '从发起请求到收到第一个字节的时间，反映服务端响应与网络耗时。',
    good: 800,
    poor: 1800,
    api: "navigationTiming.responseStart - navigationTiming.requestStart",
    status: 'complementary',
  },
]

export function rateMetric(value: number, good: number, poor: number): Rating {
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

export const RATING_LABEL: Record<Rating, string> = {
  good: '良好',
  'needs-improvement': '需要优化',
  poor: '较差',
}
