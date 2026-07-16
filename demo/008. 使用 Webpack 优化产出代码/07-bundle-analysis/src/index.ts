import {
  generateData,
  groupData,
  flattenData,
  doubleAll,
  keepEvens,
} from './utils/dataProcessor'

const app = document.getElementById('app')

if (app) {
  const raw = generateData(20)
  const grouped = groupData(raw, 5)
  const flat = flattenData(grouped)
  const doubled = doubleAll(flat)
  const evens = keepEvens(doubled)

  app.innerHTML = `
    <h1>Bundle Analysis 演示</h1>
    <p>原始数据（前 10 项）：${JSON.stringify(raw.slice(0, 10))}</p>
    <p>分组结果：${JSON.stringify(grouped)}</p>
    <p>翻倍后偶数：${JSON.stringify(evens.slice(0, 10))}</p>
    <p style="color:#888">
      构建后打开 <code>dist/bundle-report.html</code> 查看可视化分析报告。<br>
      Treemap 中每个矩形代表一个模块，面积越大体积越大。<br>
      可以看到 lodash 在 vendors chunk 中占据了大部分体积。
    </p>
    <p style="color:#888">
      也可使用 <code>webpack --profile --json &gt; stats.json</code><br>
      配合 <a href="https://webpack.github.io/analyse/">webpack 官方分析工具</a> 深入分析。
    </p>
  `
}
