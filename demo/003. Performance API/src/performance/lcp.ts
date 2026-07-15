import type { LcpEntry } from './types'

/**
 * Largest Contentful Paint (LCP) API
 * 通过 PerformanceObserver 监听 'largest-contentful-paint' 事件
 *
 * LCP 衡量的是页面主要内容块首次完全渲染的时间，是 Web Vitals 的核心指标之一
 *
 * 评级标准：
 *   - < 2.5s  -> 良好 (good)
 *   - 2.5~4s  -> 需要改进 (needs improvement)
 *   - > 4s    -> 较差 (poor)
 *
 * 注意：LCP 事件可能多次触发（每次有更大的内容块渲染时），
 *       只有最后一次（用户首次交互前）才是最终的 LCP 值
 */

let latestLcpEntry: LcpEntry | null = null

/**
 * 开始监听 LCP 事件
 * @param callback 每次 LCP 更新时的回调
 * @returns 清理函数，调用后停止监听
 */
export function observeLCP(callback?: (entry: LcpEntry) => void): () => void {
  // 检查浏览器是否支持 LCP
  if (!('PerformanceObserver' in window)) {
    return () => {}
  }

  let observer: PerformanceObserver | null = null

  try {
    observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      if (entries.length === 0) return

      // 取最后一个条目作为最新的 LCP
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number
        renderTime: number
        loadTime: number
        size: number
        element: Element | null
        url: string
      }

      const lcpEntry: LcpEntry = {
        startTime: lastEntry.startTime,
        renderTime: lastEntry.renderTime || lastEntry.loadTime,
        loadTime: lastEntry.loadTime,
        size: lastEntry.size,
        elementType: lastEntry.element ? lastEntry.element.tagName.toLowerCase() : 'unknown',
        url: lastEntry.url || '',
      }

      latestLcpEntry = lcpEntry
      callback?.(lcpEntry)
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (e) {
    // 某些浏览器可能不支持此类型
    console.warn('LCP 观察器启动失败:', e)
  }

  return () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }
}

/** 获取当前已记录的 LCP 值 */
export function getLatestLCP(): LcpEntry | null {
  return latestLcpEntry
}
