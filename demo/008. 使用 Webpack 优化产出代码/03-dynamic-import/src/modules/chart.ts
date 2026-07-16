import { chunk, flatten } from 'lodash'

/**
 * 图表模块（模拟重量级组件）
 *
 * 这个模块依赖 lodash，体积较大。
 * 如果静态导入，lodash 和图表代码都会进入首屏 bundle。
 * 通过动态 import()，这部分代码会被拆分为独立 chunk，按需加载。
 */

export interface ChartData {
  label: string
  value: number
}

export function renderChart(container: HTMLElement, data: ChartData[]): void {
  const numbers = data.map((d) => d.value)
  const grouped = chunk(numbers, 5)
  const allValues = flatten(grouped)

  const max = Math.max(...allValues)
  const bars = data
    .map((d) => {
      const height = max > 0 ? (d.value / max) * 100 : 0
      return `<div style="display:inline-block;width:40px;margin:0 4px;text-align:center;">
        <div style="height:${height}px;background:#42b883;border-radius:4px 4px 0 0;"></div>
        <div style="font-size:11px;margin-top:4px;">${d.label}</div>
      </div>`
    })
    .join('')

  container.innerHTML = `
    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-top:12px;">
      <h3 style="margin:0 0 8px;">图表模块（按需加载）</h3>
      <div style="height:120px;display:flex;align-items:flex-end;">${bars}</div>
    </div>
  `
}

export function calculateAverage(data: ChartData[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, d) => sum + d.value, 0) / data.length
}
