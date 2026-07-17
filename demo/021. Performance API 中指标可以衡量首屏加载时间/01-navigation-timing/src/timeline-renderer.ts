/**
 * 加载时间线可视化渲染
 *
 * 把 Navigation Timing 各阶段渲染成一条横向瀑布图：
 * - 每段宽度按阶段耗时占比（相对于 loadEventEnd）确定
 * - 颜色与 phases 中保持一致
 * - 下方提供图例与精确耗时
 */

import type { NavigationPhase } from './navigation-metrics'

export function renderTimeline(phases: NavigationPhase[], totalDuration: number): void {
  const container = document.getElementById('timeline')
  if (!container) return
  container.innerHTML = ''

  const reference = totalDuration > 0 ? totalDuration : Math.max(...phases.map((p) => p.end), 1)

  // 时间刻度线
  const axis = document.createElement('div')
  axis.className = 'timeline-axis'
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  ticks.forEach((t) => {
    const tick = document.createElement('div')
    tick.className = 'timeline-tick'
    tick.style.left = `${t * 100}%`
    tick.textContent = `${(t * reference).toFixed(0)}ms`
    axis.appendChild(tick)
  })
  container.appendChild(axis)

  // 瀑布条
  const bar = document.createElement('div')
  bar.className = 'timeline-bar'

  phases.forEach((phase) => {
    if (phase.duration <= 0 && phase.name !== 'ssl') {
      // 跳过耗时为 0 的阶段（ssl 可能被 tcp 覆盖显示，但保留展示）
      return
    }
    // 用阶段的 start/end 在整体时间轴上的占比定位
    const leftPercent = (phase.start / reference) * 100
    const widthPercent = Math.max((phase.duration / reference) * 100, 0.5)

    const segment = document.createElement('div')
    segment.className = 'timeline-segment'
    segment.style.left = `${leftPercent}%`
    segment.style.width = `${widthPercent}%`
    segment.style.backgroundColor = phase.color
    segment.title = `${phase.label}：${phase.duration.toFixed(1)}ms\n${phase.description}`

    if (widthPercent > 6) {
      const label = document.createElement('span')
      label.className = 'segment-label'
      label.textContent = phase.label
      segment.appendChild(label)
    }
    bar.appendChild(segment)
  })
  container.appendChild(bar)

  // 图例
  const legend = document.createElement('div')
  legend.className = 'timeline-legend'
  phases
    .filter((p) => p.duration > 0)
    .forEach((phase) => {
      const item = document.createElement('div')
      item.className = 'legend-item'
      item.innerHTML = `
        <span class="legend-color" style="background:${phase.color}"></span>
        <span class="legend-label">${phase.label}</span>
        <span class="legend-duration">${phase.duration.toFixed(1)} ms</span>
      `
      legend.appendChild(item)
    })
  container.appendChild(legend)

  // 总耗时
  const total = document.createElement('div')
  total.className = 'timeline-total'
  total.textContent = `页面完全加载（loadEventEnd - startTime）：${totalDuration.toFixed(1)} ms`
  container.appendChild(total)
}
