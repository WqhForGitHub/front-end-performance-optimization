/**
 * 指标卡片 + 阶段明细表 + 原始时间戳表的渲染
 */

import type {
  NavigationPhase,
  NavigationKeyMetric,
  RawNavigationEntry,
  Rating,
} from './navigation-metrics'

const RATING_LABEL: Record<Rating, string> = {
  good: '良好',
  'needs-improvement': '需要优化',
  poor: '较差',
}

const RATING_EMOJI: Record<Rating, string> = {
  good: '良好',
  'needs-improvement': '需优化',
  poor: '较差',
}

/** 渲染关键指标卡片 */
export function renderKeyMetricsCards(metrics: NavigationKeyMetric[]): void {
  const container = document.getElementById('key-metrics')
  if (!container) return
  container.innerHTML = ''

  metrics.forEach((metric) => {
    const card = document.createElement('div')
    card.className = `metric-card rating-${metric.rating}`
    card.innerHTML = `
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">
        <span class="metric-number">${metric.value.toFixed(1)}</span>
        <span class="metric-unit">ms</span>
      </div>
      <div class="metric-desc">${metric.description}</div>
      <div class="metric-rating rating-${metric.rating}">${RATING_EMOJI[metric.rating]}</div>
    `
    container.appendChild(card)
  })
}

/** 渲染阶段明细表 */
export function renderMetricsTable(phases: NavigationPhase[]): void {
  const tbody = document.getElementById('metrics-tbody')
  if (!tbody) return
  tbody.innerHTML = ''

  phases.forEach((phase) => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>
        <span class="phase-dot" style="background:${phase.color}"></span>
        ${phase.label}
      </td>
      <td>${phase.start.toFixed(1)} ms</td>
      <td>${phase.end.toFixed(1)} ms</td>
      <td class="duration-cell">${phase.duration.toFixed(1)} ms</td>
      <td class="phase-desc">${phase.description}</td>
    `
    tbody.appendChild(row)
  })
}

/** 渲染原始 Navigation Timing 时间戳表 */
export function renderRawEntry(rawEntry: RawNavigationEntry): void {
  const tbody = document.getElementById('raw-tbody')
  if (!tbody) return
  tbody.innerHTML = ''

  Object.entries(rawEntry).forEach(([key, value]) => {
    const row = document.createElement('tr')
    const display = typeof value === 'number' ? `${value.toFixed(2)} ms` : String(value)
    row.innerHTML = `
      <td><code>${key}</code></td>
      <td>${display}</td>
    `
    tbody.appendChild(row)
  })
}

export { RATING_LABEL }
