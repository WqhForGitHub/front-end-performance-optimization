// 模拟「图表库」（类似 echarts / chart.js 的简化版）
// 体积假设 ~180KB。只有用户真正点击「渲染图表」时才需要下载。
// 通过 dynamic import() 加载，会被 Vite 拆成独立 chunk：assets/chart-[hash].js

export interface ChartPoint {
  label: string
  value: number
}

export interface ChartConfig {
  width: number
  height: number
  color: string
}

// 模拟库内部初始化（真实图表库会在此注册主题、渲染器等）
let initialized = false
function initChartEngine() {
  if (initialized) return
  // 模拟一些初始化开销
  const dummy = new Array(1000).fill(0).map((_, i) => Math.sin(i / 100))
  void dummy
  initialized = true
}

export function renderBarChart(points: ChartPoint[], config: ChartConfig): string[] {
  initChartEngine()
  const max = Math.max(...points.map((p) => p.value), 1)
  return points.map((p) => {
    const bars = Math.round((p.value / max) * 20)
    const bar = '\u2588'.repeat(bars)
    return `${p.label.padEnd(8)} ${bar} ${p.value}`
  })
}

export function renderLineChart(points: ChartPoint[]): string {
  initChartEngine()
  const max = Math.max(...points.map((p) => p.value), 1)
  const min = Math.min(...points.map((p) => p.value), 0)
  const range = max - min || 1
  const grid: string[] = []
  for (let row = 5; row >= 0; row--) {
    const threshold = min + (range * row) / 5
    const line = points
      .map((p) => (p.value >= threshold ? '\u25CF' : '\u00B7'))
      .join(' ')
    grid.push(`${String(Math.round(threshold)).padStart(4)} | ${line}`)
  }
  return grid.join('\n')
}

export function computeStats(points: ChartPoint[]) {
  const values = points.map((p) => p.value)
  const sum = values.reduce((a, b) => a + b, 0)
  const mean = sum / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  return {
    sum: round2(sum),
    mean: round2(mean),
    std: round2(Math.sqrt(variance)),
    max: Math.max(...values),
    min: Math.min(...values),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export const CHART_LIB_VERSION = 'mini-chart@3.2.0 (simulated, ~180KB)'
