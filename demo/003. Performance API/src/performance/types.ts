/** Performance API 相关类型定义 */

/** 导航计时阶段 */
export interface NavPhase {
  label: string
  start: number
  end: number
  duration: number
  color: string
  desc: string
}

/** 关键性能指标 */
export interface PerformanceMetric {
  name: string
  label: string
  value: number
  unit: string
  desc: string
  /** 评级：good / needs-improvement / poor */
  rating: 'good' | 'needs-improvement' | 'poor' | 'info'
}

/** 绘制计时条目 */
export interface PaintEntry {
  name: string
  label: string
  startTime: number
  desc: string
}

/** LCP 条目 */
export interface LcpEntry {
  startTime: number
  renderTime: number
  loadTime: number
  size: number
  elementType: string
  url: string
}

/** 资源计时条目 */
export interface ResourceEntry {
  name: string
  initiatorType: string
  duration: number
  transferSize: number
  decodedBodySize: number
  startTime: number
  responseEnd: number
}
