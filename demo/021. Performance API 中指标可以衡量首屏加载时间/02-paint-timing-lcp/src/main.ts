/**
 * Paint Timing + LCP 演示主入口
 *
 * 1. 使用 PerformanceObserver 实时监听 'paint' 与 'largest-contentful-paint'
 * 2. 把 FP / FCP / LCP 实时刷新到仪表盘卡片上
 * 3. 用户首次交互后冻结 LCP（与浏览器实际行为一致）
 * 4. 渲染指标定义与阈值表，并展示 FMP 等已废弃指标的概念
 */

import { observePaintMetrics, type PaintMetric } from './paint-observer'
import { observeLCP, freezeLCPOnInteraction, type LCPEntry } from './lcp-observer'
import {
  renderDashboard,
  renderDefinitionsTable,
  renderLCPDetail,
  updateMetric,
  finalizeMetric,
  appendLog,
} from './dashboard'
import { simulateContentLoad } from './content-simulator'

function init(): void {
  renderDashboard()
  renderDefinitionsTable()

  let latestLCP: LCPEntry | null = null

  // ---- 1. Paint Timing：监听 FP / FCP ----
  observePaintMetrics((metric: PaintMetric) => {
    if (metric.name === 'first-paint') {
      updateMetric('fp', metric.startTime)
      appendLog(`FP 捕获：${metric.startTime.toFixed(1)}ms`, 'metric')
    } else if (metric.name === 'first-contentful-paint') {
      updateMetric('fcp', metric.startTime)
      appendLog(`FCP 捕获：${metric.startTime.toFixed(1)}ms`, 'metric')
    }
  })

  // ---- 2. LCP：监听最大内容绘制 ----
  observeLCP((entry: LCPEntry) => {
    latestLCP = entry
    updateMetric('lcp', entry.startTime)
    renderLCPDetail({
      element: entry.element,
      size: entry.size,
      startTime: entry.startTime,
      index: entry.index,
      url: entry.url,
    })
    appendLog(
      `LCP 第 ${entry.index} 次更新：${entry.startTime.toFixed(1)}ms（${entry.element}, ${entry.size}px²）`,
      'metric',
    )
  })

  // ---- 3. 用户首次交互后冻结 LCP ----
  freezeLCPOnInteraction(
    () => latestLCP,
    (final) => {
      finalizeMetric('lcp')
      if (final) {
        appendLog(
          `用户首次交互，LCP 冻结为最终值：${final.startTime.toFixed(1)}ms`,
          'final',
        )
      } else {
        appendLog('用户首次交互，但未捕获到 LCP 条目', 'final')
      }
    },
  )

  // ---- 4. 模拟内容渐进式加载 ----
  simulateContentLoad()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
