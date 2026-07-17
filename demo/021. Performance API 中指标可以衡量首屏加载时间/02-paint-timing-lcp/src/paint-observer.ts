/**
 * Paint Timing 观察者
 *
 * 通过 PerformanceObserver 监听 'paint' 类型条目，
 * 捕获 first-paint (FP) 与 first-contentful-paint (FCP)。
 *
 * buffered: true 使得在观察者建立之前已经发生的 paint 事件也能被补发。
 */

export type PaintName = 'first-paint' | 'first-contentful-paint'

export interface PaintMetric {
  name: PaintName
  startTime: number
  duration: number
  /** 采集时刻 performance.now() */
  capturedAt: number
}

export type PaintCallback = (metric: PaintMetric) => void

export function observePaintMetrics(callback: PaintCallback): PerformanceObserver | null {
  let observer: PerformanceObserver | null = null

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback({
          name: entry.name as PaintName,
          startTime: entry.startTime,
          duration: entry.duration,
          capturedAt: performance.now(),
        })
      }
    })
    observer.observe({ type: 'paint', buffered: true })
    return observer
  } catch (err) {
    // 降级方案：直接读取已存在的 paint 条目（不支持 buffered 时）
    console.warn('[Paint Timing] PerformanceObserver 不支持，降级到直接读取', err)
    const entries = performance.getEntriesByType('paint')
    entries.forEach((entry) => {
      callback({
        name: entry.name as PaintName,
        startTime: entry.startTime,
        duration: entry.duration,
        capturedAt: performance.now(),
      })
    })
    return null
  }
}
