/**
 * Navigation Timing 演示主入口
 *
 * 通过 performance.getEntriesByType('navigation') 获取本页面的加载时间线，
 * 渲染：关键指标卡片 + 瀑布时间线 + 阶段明细表 + 原始时间戳表。
 *
 * 注意：loadEventEnd 只有在 window.load 事件结束后才有值，
 *      因此我们在 load 事件回调里再用 setTimeout(0) 等待一帧。
 */

import { collectNavigationMetrics } from './navigation-metrics'
import { renderTimeline } from './timeline-renderer'
import { renderKeyMetricsCards, renderMetricsTable, renderRawEntry } from './metrics-table'

function renderUnsupported(message: string): void {
  const root = document.getElementById('app')
  if (!root) return
  const tip = document.createElement('div')
  tip.className = 'unsupported'
  tip.textContent = message
  root.prepend(tip)
}

function init(): void {
  const entries = performance.getEntriesByType('navigation')
  const nav = entries[0] as PerformanceNavigationTiming | undefined

  if (!nav) {
    renderUnsupported(
      '当前浏览器不支持 Navigation Timing API（performance.getEntriesByType("navigation") 返回为空）。',
    )
    return
  }

  // loadEventEnd 可能在 load 事件同步回调里仍为 0，延迟到下一帧取
  if (nav.loadEventEnd === 0) {
    requestAnimationFrame(init)
    return
  }

  const { phases, keyMetrics, rawEntry, totalDuration } = collectNavigationMetrics(nav)

  renderKeyMetricsCards(keyMetrics)
  renderTimeline(phases, totalDuration)
  renderMetricsTable(phases)
  renderRawEntry(rawEntry)

  // 在标题处显示页面 URL 与传输体积
  const meta = document.getElementById('meta-info')
  if (meta) {
    const transferSize = (rawEntry['transferSize'] as number) ?? 0
    const decoded = (rawEntry['decodedBodySize'] as number) ?? 0
    meta.textContent = `页面：${rawEntry['name']} | 传输体积：${transferSize} B | 解码后体积：${decoded} B | 加载类型：${rawEntry['type']}`
  }
}

window.addEventListener('load', () => {
  // 等 loadEventEnd 落定
  setTimeout(init, 0)
})

// 如果 load 事件已经触发（脚本延迟加载），直接尝试初始化
if (document.readyState === 'complete') {
  setTimeout(init, 0)
}
