/**
 * 实时仪表盘渲染
 *
 * 维护 FP / FCP / LCP 三张卡片的状态，并在指标更新时实时刷新数值与评级。
 * 同时渲染 LCP 元素信息与事件日志。
 */

import { METRIC_DEFINITIONS, rateMetric, RATING_LABEL } from './thresholds'
import type { Rating } from './thresholds'

export interface MetricKey {
  id: 'fp' | 'fcp' | 'lcp'
  label: string
  short: string
  good: number
  poor: number
}

const METRIC_KEYS: MetricKey[] = [
  { id: 'fp', label: 'First Paint 首次绘制', short: 'FP', good: 1500, poor: 3000 },
  {
    id: 'fcp',
    label: 'First Contentful Paint 首次内容绘制',
    short: 'FCP',
    good: 1800,
    poor: 3000,
  },
  {
    id: 'lcp',
    label: 'Largest Contentful Paint 最大内容绘制',
    short: 'LCP',
    good: 2500,
    poor: 4000,
  },
]

/** 初始化仪表盘骨架 */
export function renderDashboard(): void {
  const container = document.getElementById('dashboard')
  if (!container) return
  container.innerHTML = ''

  METRIC_KEYS.forEach((m) => {
    const card = document.createElement('div')
    card.className = 'dash-card'
    card.id = `card-${m.id}`
    card.innerHTML = `
      <div class="dash-short">${m.short}</div>
      <div class="dash-label">${m.label}</div>
      <div class="dash-value" id="value-${m.id}">--<span class="unit">ms</span></div>
      <div class="dash-bar-wrap">
        <div class="dash-bar good-zone" title="良好 ≤ ${m.good}ms"></div>
        <div class="dash-bar needs-zone" title="需优化 ${m.good}-${m.poor}ms"></div>
        <div class="dash-bar poor-zone" title="较差 > ${m.poor}ms"></div>
        <div class="dash-marker" id="marker-${m.id}"></div>
      </div>
      <div class="dash-status pending" id="status-${m.id}">等待数据...</div>
    `
    container.appendChild(card)
  })
}

/** 更新单个指标 */
export function updateMetric(id: MetricKey['id'], value: number): void {
  const valueEl = document.getElementById(`value-${id}`)
  const statusEl = document.getElementById(`status-${id}`)
  const markerEl = document.getElementById(`marker-${id}`)
  const cardEl = document.getElementById(`card-${id}`)

  if (valueEl) {
    valueEl.innerHTML = `${value.toFixed(1)}<span class="unit">ms</span>`
  }

  const def = METRIC_KEYS.find((m) => m.id === id)
  if (!def) return

  const rating = rateMetric(value, def.good, def.poor)

  if (statusEl) {
    statusEl.className = `dash-status rating-${rating}`
    statusEl.textContent = `${RATING_LABEL[rating]}（${rating === 'good' ? `≤ ${def.good}` : rating === 'needs-improvement' ? `${def.good}-${def.poor}` : `> ${def.poor}`}ms）`
  }

  if (cardEl) {
    cardEl.className = `dash-card rating-${rating}`
  }

  // 标记位置：将数值映射到 0 ~ maxScale（取 poor 的 1.5 倍为满刻度，超出则贴边）
  if (markerEl) {
    const maxScale = def.poor * 1.5
    const percent = Math.min((value / maxScale) * 100, 100)
    markerEl.style.left = `${percent}%`
    markerEl.title = `${value.toFixed(1)}ms`
  }
}

/** 标记 LCP 为最终值 */
export function finalizeMetric(id: MetricKey['id']): void {
  const cardEl = document.getElementById(`card-${id}`)
  if (cardEl) {
    const badge = document.createElement('div')
    badge.className = 'final-badge'
    badge.textContent = '已冻结'
    cardEl.querySelector('.dash-short')?.appendChild(badge)
  }
}

/** 渲染 LCP 元素详情 */
export function renderLCPDetail(detail: {
  element: string
  size: number
  startTime: number
  index: number
  url: string
}): void {
  const el = document.getElementById('lcp-detail')
  if (!el) return
  el.innerHTML = `
    <div class="detail-row"><span>当前 LCP 元素</span><code>${detail.element}</code></div>
    <div class="detail-row"><span>元素面积</span><strong>${detail.size.toLocaleString()} px²</strong></div>
    <div class="detail-row"><span>渲染时间</span><strong>${detail.startTime.toFixed(1)} ms</strong></div>
    <div class="detail-row"><span>LCP 更新次数</span><strong>${detail.index}</strong></div>
    ${
      detail.url
        ? `<div class="detail-row"><span>资源 URL</span><code class="url">${detail.url}</code></div>`
        : ''
    }
  `
}

/** 渲染指标定义与阈值表 */
export function renderDefinitionsTable(): void {
  const tbody = document.getElementById('definitions-tbody')
  if (!tbody) return
  tbody.innerHTML = ''

  METRIC_DEFINITIONS.forEach((def) => {
    const row = document.createElement('tr')
    row.className = `status-${def.status}`
    row.innerHTML = `
      <td><strong>${def.name}</strong></td>
      <td>${def.fullName}</td>
      <td>${def.description}</td>
      <td class="t-good">≤ ${def.good} ms</td>
      <td class="t-needs">${def.good} - ${def.poor} ms</td>
      <td class="t-poor">> ${def.poor} ms</td>
      <td><code>${def.api}</code></td>
      <td><span class="status-tag status-${def.status}">${
        def.status === 'recommended' ? '推荐' : def.status === 'deprecated' ? '已废弃' : '补充'
      }</span></td>
    `
    tbody.appendChild(row)
  })
}

/** 追加一条事件日志 */
export function appendLog(message: string, type: 'info' | 'metric' | 'final' = 'info'): void {
  const log = document.getElementById('event-log')
  if (!log) return
  const item = document.createElement('div')
  item.className = `log-item log-${type}`
  const time = performance.now().toFixed(1)
  item.textContent = `[${time}ms] ${message}`
  log.appendChild(item)
  log.scrollTop = log.scrollHeight
}

export function ratingLabel(rating: Rating): string {
  return RATING_LABEL[rating]
}
