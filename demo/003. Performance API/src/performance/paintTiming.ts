import type { PaintEntry } from './types'

/**
 * Paint Timing API
 * 通过 performance.getEntriesByType('paint') 获取页面绘制时间点
 *
 * 两个核心指标：
 *   - first-paint (FP): 浏览器首次绘制任何内容的时间
 *   - first-contentful-paint (FCP): 浏览器首次绘制 DOM 内容（文本、图片等）的时间
 *
 * FCP 是衡量首屏加载体验的关键指标：
 *   - < 1.8s  -> 良好 (good)
 *   - 1.8~3s  -> 需要改进 (needs improvement)
 *   - > 3s    -> 较差 (poor)
 */

/** 获取 Paint Timing 条目 */
export function getPaintEntries(): PaintEntry[] {
  const entries = performance.getEntriesByType('paint')
  const result: PaintEntry[] = []

  for (const entry of entries) {
    const name = entry.name
    let label = ''
    let desc = ''

    if (name === 'first-paint') {
      label = 'FP（首次绘制）'
      desc = '浏览器首次在屏幕上绘制任何内容（如背景色）的时间'
    } else if (name === 'first-contentful-paint') {
      label = 'FCP（首次内容绘制）'
      desc = '浏览器首次绘制 DOM 内容（文本、图片、SVG 等）的时间，是衡量首屏加载的关键指标'
    } else {
      label = name
      desc = '自定义绘制时间点'
    }

    result.push({
      name,
      label,
      startTime: entry.startTime,
      desc,
    })
  }

  return result
}

/** 获取 FCP 时间（ms），如果没有则返回 null */
export function getFCP(): number | null {
  const entries = performance.getEntriesByType('paint')
  const fcp = entries.find((e) => e.name === 'first-contentful-paint')
  return fcp ? fcp.startTime : null
}

/** 获取 FP 时间（ms），如果没有则返回 null */
export function getFP(): number | null {
  const entries = performance.getEntriesByType('paint')
  const fp = entries.find((e) => e.name === 'first-paint')
  return fp ? fp.startTime : null
}
