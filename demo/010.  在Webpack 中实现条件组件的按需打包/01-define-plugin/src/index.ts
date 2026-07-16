/**
 * 入口文件：演示 DefinePlugin 条件打包
 *
 * 通过 process.env.FEATURE_X 作为开关，决定是否加载某个功能模块。
 * DefinePlugin 在编译期把 process.env.FEATURE_X 替换成字面量 true/false，
 * 压缩器会把 if (false) {...} 这类死代码整块删除，
 * 从而实现"不需要的功能不进入最终产物"。
 */
import { applyTheme } from './features/featureC'

const app = document.getElementById('app')
if (!app) {
  throw new Error('找不到 #app 容器')
}

const messages: string[] = []

// 功能 C：主题切换 —— 常驻功能，总是打包
messages.push(applyTheme('light'))

/**
 * 功能 A：图表模块
 *
 * 编译期 process.env.FEATURE_A 会被替换为 true / false。
 * - 若为 true，整个 if 块保留，featureA 模块进入产物。
 * - 若为 false，整个 if 块成为死代码，featureA 模块不会进入产物。
 */
if (process.env.FEATURE_A === 'true') {
  // 使用动态 import 的静态等价写法：这里用普通 import 即可
  // 因为 DefinePlugin 在编译期决定死代码，不需要 dynamic import
  const { renderChart, exportChart } = require('./features/featureA')
  const chartData = [
    { label: '一月', value: 100 },
    { label: '二月', value: 200 },
    { label: '三月', value: 150 },
  ]
  messages.push(renderChart(chartData))
  messages.push(exportChart(chartData))
}

/**
 * 功能 B：导出 Excel 模块
 *
 * 同理：当 FEATURE_B=false 时，此分支及其依赖的 featureB 会被移除。
 */
if (process.env.FEATURE_B === 'true') {
  const { exportToExcel } = require('./features/featureB')
  const rows = [
    { 姓名: '张三', 年龄: 28 },
    { 姓名: '李四', 年龄: 32 },
  ]
  messages.push(exportToExcel(rows))
}

// 渲染结果到页面
app.innerHTML = `
  <div style="font-family: sans-serif; padding: 24px;">
    <h1>DefinePlugin 条件打包演示</h1>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${messages.join('\n\n')}</pre>
    <p style="color:#666;">
      提示：修改 webpack.config.ts 中 DefinePlugin 的 FEATURE_A / FEATURE_B 取值，
      重新 build 后对比 dist/bundle.js 体积即可看到差异。
    </p>
  </div>
`
