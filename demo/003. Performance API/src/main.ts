import './styles.css'
import { getNavigationPhases, getKeyMetrics } from './performance/navigationTiming'
import { getPaintEntries } from './performance/paintTiming'
import { observeLCP, getLatestLCP } from './performance/lcp'
import { getResourceStats, getResourceSummary } from './performance/resourceTiming'
import { demoUserTiming } from './performance/userTiming'
import type { PerformanceMetric } from './performance/types'

/** 格式化毫秒 */
function fmtMs(ms: number): string {
  if (ms < 1) return '<1'
  if (ms < 1000) return ms.toFixed(1)
  return (ms / 1000).toFixed(2)
}

/** 格式化字节 */
function fmtBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/** 评级颜色映射 */
const ratingClass: Record<string, string> = {
  good: 'rating-good',
  'needs-improvement': 'rating-needs-improvement',
  poor: 'rating-poor',
  info: 'rating-info',
}

/** 渲染：关键性能指标卡片 */
function renderMetrics(container: HTMLElement, metrics: PerformanceMetric[]): void {
  const html = metrics
    .map(
      (m) => `
    <div class="metric-card ${ratingClass[m.rating] || ''}">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${fmtMs(m.value)}<span class="metric-unit">${m.unit}</span></div>
      <div class="metric-desc">${m.desc}</div>
    </div>
  `,
    )
    .join('')
  container.innerHTML = html
}

/** 渲染：加载时间线 */
function renderTimeline(container: HTMLElement): void {
  const phases = getNavigationPhases()
  if (phases.length === 0) {
    container.innerHTML = '<p class="desc">暂无 Navigation Timing 数据</p>'
    return
  }

  const maxEnd = Math.max(...phases.map((p) => p.end))

  const html = phases
    .map((p) => {
      const leftPct = (p.start / maxEnd) * 100
      const widthPct = Math.max((p.duration / maxEnd) * 100, 0.5)
      return `
      <div class="timeline-bar">
        <span class="phase-label">${p.label}</span>
        <div class="phase-bar-wrapper">
          <div class="phase-bar" style="
            background: ${p.color};
            margin-left: ${leftPct}%;
            width: ${widthPct}%;
          ">
            ${p.duration > 0 ? fmtMs(p.duration) + 'ms' : ''}
          </div>
        </div>
      </div>
      <div class="phase-desc">${p.desc}</div>
    `
    })
    .join('')

  container.innerHTML = html
}

/** 渲染：绘制时间点（FP / FCP） */
function renderPaint(container: HTMLElement): void {
  const entries = getPaintEntries()
  if (entries.length === 0) {
    container.innerHTML = '<p class="desc">暂无 Paint Timing 数据</p>'
    return
  }

  const html = entries
    .map(
      (e) => `
    <div class="paint-item">
      <div class="paint-label">${e.label}</div>
      <div class="paint-time">${fmtMs(e.startTime)}<span class="paint-unit">ms</span></div>
      <div class="paint-desc">${e.desc}</div>
    </div>
  `,
    )
    .join('')

  container.innerHTML = `<div class="paint-list">${html}</div>`
}

/** 渲染：LCP（最大内容绘制） */
function renderLCP(container: HTMLElement): void {
  const entry = getLatestLCP()
  if (!entry) {
    container.innerHTML = '<p class="desc">等待 LCP 数据...（请稍后刷新或滚动页面触发）</p>'
    return
  }

  const value = entry.renderTime || entry.startTime
  const rating = value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
  const ratingColor =
    rating === 'good' ? '#52c41a' : rating === 'needs-improvement' ? '#faad14' : '#ff4d4f'

  container.innerHTML = `
    <div class="lcp-display">
      <div class="lcp-value" style="color: ${ratingColor}">
        ${fmtMs(value)}<span class="lcp-unit">ms</span>
      </div>
      <div class="lcp-info">
        元素类型: <strong>${entry.elementType}</strong>
        · 内容大小: ${fmtBytes(entry.size)}
        ${entry.url ? `· URL: ${entry.url.substring(0, 60)}...` : ''}
      </div>
    </div>
  `
}

/** 渲染：资源计时统计 */
function renderResources(container: HTMLElement): void {
  const stats = getResourceStats()
  const summary = getResourceSummary()

  if (stats.length === 0) {
    container.innerHTML = '<p class="desc">暂无资源加载数据</p>'
    return
  }

  const tableRows = stats
    .map(
      (s) => `
    <tr>
      <td>${s.type}</td>
      <td>${s.count}</td>
      <td>${fmtMs(s.totalDuration)} ms</td>
      <td>${fmtBytes(s.totalTransferSize)}</td>
    </tr>
  `,
    )
    .join('')

  container.innerHTML = `
    <p class="desc">
      总资源数: <strong>${summary.totalResources}</strong>
      · 总传输大小: <strong>${fmtBytes(summary.totalTransferSize)}</strong>
      · 总耗时: <strong>${fmtMs(summary.totalDuration)} ms</strong>
    </p>
    <table class="resource-table">
      <thead>
        <tr>
          <th>资源类型</th>
          <th>数量</th>
          <th>总耗时</th>
          <th>传输大小</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `
}

/** 渲染：用户计时演示 */
function renderUserTiming(container: HTMLElement): void {
  const measures = demoUserTiming()

  const html = measures
    .map(
      (m) => `
    <li>
      <span class="ut-name">${m.name}</span>
      <span class="ut-duration">${fmtMs(m.duration)} ms</span>
    </li>
  `,
    )
    .join('')

  container.innerHTML = `<ul class="user-timing-list">${html}</ul>`
}

/** 初始化整个仪表盘 */
function initDashboard(): void {
  const app = document.getElementById('app')
  if (!app) return

  app.innerHTML = `
    <div class="container">
      <h1>Performance API - 首屏加载时间指标</h1>
      <p class="subtitle">使用浏览器原生 Performance API 测量和分析页面加载性能</p>

      <div class="info-banner">
        提示：以下数据通过 <code>performance.getEntriesByType()</code> 和
        <code>PerformanceObserver</code> 获取。点击「刷新数据」重新采集。
      </div>

      <div class="card">
        <h2>关键性能指标</h2>
        <p class="desc">从导航开始到各关键节点的时间，衡量首屏加载各阶段性能</p>
        <div id="metrics"></div>
        <div class="legend">
          <span class="legend-item"><span class="legend-dot good"></span> 良好</span>
          <span class="legend-item"><span class="legend-dot needs-improvement"></span> 需改进</span>
          <span class="legend-item"><span class="legend-dot poor"></span> 较差</span>
        </div>
      </div>

      <div class="card">
        <h2>页面加载时间线</h2>
        <p class="desc">Navigation Timing 各阶段可视化（颜色区分不同阶段）</p>
        <div id="timeline" class="timeline"></div>
      </div>

      <div class="card">
        <h2>绘制时间点（FP / FCP）</h2>
        <p class="desc">Paint Timing API - 首次绘制和首次内容绘制时间</p>
        <div id="paint"></div>
      </div>

      <div class="card">
        <h2>LCP（最大内容绘制）</h2>
        <p class="desc">Largest Contentful Paint - 页面主要内容块首次完全渲染的时间（Core Web Vitals 核心指标）</p>
        <div id="lcp"></div>
      </div>

      <div class="card">
        <h2>资源加载统计</h2>
        <p class="desc">Resource Timing API - 按类型分组的资源加载耗时和大小</p>
        <div id="resources"></div>
      </div>

      <div class="card">
        <h2>User Timing 演示</h2>
        <p class="desc">使用 performance.mark() 和 performance.measure() 标记自定义性能节点</p>
        <div id="user-timing"></div>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <button class="btn" id="refresh-btn">刷新数据</button>
      </div>
    </div>
  `

  // 渲染各部分
  const metricsEl = document.getElementById('metrics')!
  const timelineEl = document.getElementById('timeline')!
  const paintEl = document.getElementById('paint')!
  const lcpEl = document.getElementById('lcp')!
  const resourcesEl = document.getElementById('resources')!
  const userTimingEl = document.getElementById('user-timing')!

  function renderAll(): void {
    renderMetrics(metricsEl, getKeyMetrics())
    renderTimeline(timelineEl)
    renderPaint(paintEl)
    renderLCP(lcpEl)
    renderResources(resourcesEl)
    renderUserTiming(userTimingEl)
  }

  // 初始渲染
  renderAll()

  // 刷新按钮
  document.getElementById('refresh-btn')!.addEventListener('click', () => {
    renderAll()
  })

  // 监听 LCP 变化，实时更新
  observeLCP(() => {
    renderLCP(lcpEl)
  })

  // 页面 load 事件后重新渲染（确保 loadEventEnd 有值）
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      setTimeout(renderAll, 100)
    })
  } else {
    setTimeout(renderAll, 100)
  }
}

// DOM 就绪后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard)
} else {
  initDashboard()
}
