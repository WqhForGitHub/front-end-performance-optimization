/**
 * Dynamic Import 演示入口
 *
 * 主 bundle 只包含基础 UI 代码。
 * 图表模块和导出工具模块通过 import() 按需加载，
 * 被拆分为独立 chunk，减小首屏体积。
 */

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>Dynamic Import 演示</h1>
    <p>首屏只加载了主 bundle，图表和导出功能按需加载。</p>
    <button id="load-chart" style="padding:8px 16px;margin:4px;cursor:pointer;">
      加载图表模块
    </button>
    <button id="load-export" style="padding:8px 16px;margin:4px;cursor:pointer;">
      加载导出模块
    </button>
    <div id="chart-container"></div>
    <div id="export-result"></div>
    <p style="color:#888;margin-top:16px;">
      点击按钮时，对应模块的 chunk 才会通过网络请求加载。<br>
      打开 DevTools Network 面板可以看到额外的 .js 文件按需下载。
    </p>
  `
}

// 点击按钮后动态加载图表模块
document.getElementById('load-chart')?.addEventListener('click', async () => {
  // webpackChunkName 魔法注释指定 chunk 名称
  const { renderChart, calculateAverage } = await import(
    /* webpackChunkName: "chart" */
    './modules/chart'
  )

  const container = document.getElementById('chart-container')
  if (!container) return

  const data = [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 60 },
    { label: 'Mar', value: 45 },
    { label: 'Apr', value: 80 },
    { label: 'May', value: 55 },
  ]

  renderChart(container, data)

  const avg = calculateAverage(data)
  container.insertAdjacentHTML('beforeend', `<p>平均值：${avg.toFixed(1)}</p>`)
})

// 点击按钮后动态加载导出模块
document.getElementById('load-export')?.addEventListener('click', async () => {
  const { exportData } = await import(
    /* webpackChunkName: "export-util" */
    './modules/exportUtil'
  )

  const result = exportData(
    [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ],
    { format: 'json', filename: 'users.json' },
  )

  const resultDiv = document.getElementById('export-result')
  if (resultDiv) {
    resultDiv.innerHTML = `
      <div style="margin-top:12px;padding:12px;background:#f5f5f5;border-radius:6px;">
        <strong>导出模块（按需加载）</strong>
        <pre style="margin:8px 0 0;font-size:13px;">${result}</pre>
      </div>
    `
  }
})
