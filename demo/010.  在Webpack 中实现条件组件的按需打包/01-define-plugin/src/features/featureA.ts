/**
 * 功能 A：图表模块
 *
 * 这是一个体积较大的"图表"功能模块。
 * 通过 DefinePlugin 注入的 process.env.FEATURE_A 控制其是否被打包。
 */
export interface ChartData {
  label: string
  value: number
}

export function renderChart(data: ChartData[]): string {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return data
    .map((item) => {
      const percent = ((item.value / total) * 100).toFixed(2)
      return `[图表] ${item.label}: ${percent}%`
    })
    .join('\n')
}

export function exportChart(data: ChartData[]): string {
  // 导出图表为图片（模拟一个较大的依赖）
  return `[图表] 导出 ${data.length} 条数据为 PNG 图片`
}
