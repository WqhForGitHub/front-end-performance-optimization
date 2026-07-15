import type { ResourceEntry } from './types'

/**
 * Resource Timing API
 * 通过 performance.getEntriesByType('resource') 获取每个资源（JS、CSS、图片等）的详细加载计时
 *
 * 每个资源条目包含完整的时间线：
 *   startTime -> fetchStart -> domainLookupStart -> domainLookupEnd
 *   -> connectStart -> connectEnd -> requestStart -> responseStart -> responseEnd
 *
 * 关键属性：
 *   - initiatorType: 资源类型 (script, link, img, fetch, xmlhttprequest 等)
 *   - transferSize: 传输大小（含请求头，经过压缩）
 *   - decodedBodySize: 解码后的大小
 *   - encodedBodySize: 编码后的大小
 *   - duration: 从 startTime 到 responseEnd 的总耗时
 */

/** 获取所有资源计时条目 */
export function getResourceEntries(): ResourceEntry[] {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  return entries.map((entry) => ({
    name: entry.name,
    initiatorType: entry.initiatorType,
    duration: entry.duration,
    transferSize: entry.transferSize,
    decodedBodySize: entry.decodedBodySize,
    startTime: entry.startTime,
    responseEnd: entry.responseEnd,
  }))
}

/** 按类型分组统计资源 */
export function getResourceStats(): {
  type: string
  count: number
  totalDuration: number
  totalTransferSize: number
}[] {
  const entries = getResourceEntries()
  const groups: Record<
    string,
    { count: number; totalDuration: number; totalTransferSize: number }
  > = {}

  for (const entry of entries) {
    const type = entry.initiatorType || 'other'
    if (!groups[type]) {
      groups[type] = { count: 0, totalDuration: 0, totalTransferSize: 0 }
    }
    groups[type].count++
    groups[type].totalDuration += entry.duration
    groups[type].totalTransferSize += entry.transferSize
  }

  return Object.entries(groups)
    .map(([type, stats]) => ({ type, ...stats }))
    .sort((a, b) => b.totalDuration - a.totalDuration)
}

/** 获取总资源数和总传输大小 */
export function getResourceSummary(): {
  totalResources: number
  totalTransferSize: number
  totalDuration: number
} {
  const entries = getResourceEntries()
  let totalTransferSize = 0
  let totalDuration = 0

  for (const entry of entries) {
    totalTransferSize += entry.transferSize
    totalDuration += entry.duration
  }

  return {
    totalResources: entries.length,
    totalTransferSize,
    totalDuration,
  }
}
