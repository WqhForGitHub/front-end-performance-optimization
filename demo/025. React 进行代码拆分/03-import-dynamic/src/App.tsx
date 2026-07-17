import { useState, useCallback } from 'react'
import type { FC, ReactNode } from 'react'

// 注意：这里【没有】在顶部 import 三个重型模块。
// 它们只在用户点击按钮时通过 dynamic import() 按需加载，
// Vite 会自动把每个模块拆成独立 chunk。

type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

interface ModuleStatus {
  state: LoadState
  duration: number
  error?: string
}

const SAMPLE_CSV = `name,age,city,role
Alice,28,Beijing,Engineer
Bob,34,Shanghai,Designer
Carol,41,Shenzhen,PM
Dave,26,Guangzhou,Engineer
Eve,38,Beijing,Manager`

const SAMPLE_MD = `# 代码拆分指南

## 为什么拆分
- 首屏更快
- 缓存友好

## 三种方式
1. React.lazy + Suspense
2. manualChunks
3. **dynamic import()**（当前演示）

> 按需加载是处理重型工具的最佳方式。`

const App: FC = () => {
  return (
    <div>
      <div className="hero">
        <h1>03 · 动态 import() 按需加载</h1>
        <p>
          端口：<span className="port">5254</span> &nbsp;|&nbsp; 通过原生
          <code> import() </code>在用户真正需要时才下载重型模块（图表 / Markdown / CSV），
          Vite 自动拆分独立 chunk。
        </p>
      </div>

      <Intro />
      <ModulesPlayground />
      <ChunkDiagram />
      <Comparison />
      <Principles />
    </div>
  )
}

const Intro: FC = () => (
  <div className="page">
    <h2>什么是动态 import()？</h2>
    <p>
      <code>import()</code> 是 ES2020 的原生语法，它返回一个 Promise，在运行时才发起模块请求。
      打包工具（Vite/Webpack/Rollup）会自动把动态 import 的模块拆成独立 chunk。
    </p>
    <pre className="code-block">{`// 静态 import：模块会被打进当前 chunk
import { renderBarChart } from './heavy/chart'

// 动态 import：模块被拆成独立 chunk，运行时按需下载
const mod = await import('./heavy/chart')
mod.renderBarChart(points)`}</pre>

    <div className="diagram">
      <div className="diagram-title">触发时机对比</div>
      <div className="compare">
        <div className="compare-col">
          <h4>静态 import</h4>
          <div className="flow">
            <span className="bundle-box bg-main">页面加载</span>
            <span className="flow-arrow">=&gt;</span>
            <span className="bundle-box bg-chart">图表库</span>
            <span className="flow-arrow">=&gt;</span>
            <span style={{ color: '#ef4444' }}>首屏被迫等图表</span>
          </div>
        </div>
        <div className="compare-col">
          <h4>动态 import</h4>
          <div className="flow">
            <span className="bundle-box bg-main">页面加载</span>
            <span className="flow-arrow">=&gt;</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>首屏立即可交互</span>
          </div>
          <div className="flow" style={{ marginTop: 8 }}>
            <span className="bundle-box bg-chart" style={{ opacity: 0.4 }}>图表库</span>
            <span className="flow-arrow">=&gt;</span>
            <span style={{ color: '#64748b' }}>用户点击时才下载</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ---- 三个模块的按需加载演练 ----
const ModulesPlayground: FC = () => {
  const [chartStatus, setChartStatus] = useState<ModuleStatus>({ state: 'idle', duration: 0 })
  const [chartResult, setChartResult] = useState<string>('')
  const [mdStatus, setMdStatus] = useState<ModuleStatus>({ state: 'idle', duration: 0 })
  const [mdResult, setMdResult] = useState<string>('')
  const [csvStatus, setCsvStatus] = useState<ModuleStatus>({ state: 'idle', duration: 0 })
  const [csvResult, setCsvResult] = useState<string>('')

  const loadChart = useCallback(async () => {
    setChartStatus({ state: 'loading', duration: 0 })
    const start = performance.now()
    try {
      const mod = await import('./heavy/chart')
      const duration = performance.now() - start
      const points = [
        { label: 'Jan', value: 32 }, { label: 'Feb', value: 45 },
        { label: 'Mar', value: 38 }, { label: 'Apr', value: 52 },
        { label: 'May', value: 48 }, { label: 'Jun', value: 61 },
      ]
      const bars = mod.renderBarChart(points, { width: 80, height: 20, color: '#8b5cf6' })
      const stats = mod.computeStats(points)
      setChartResult(
        bars.join('\n') +
        '\n\n--- 统计 ---\n' +
        `sum=${stats.sum} mean=${stats.mean} std=${stats.std}\n` +
        `range=[${stats.min}, ${stats.max}]\n` +
        `lib: ${mod.CHART_LIB_VERSION}`,
      )
      setChartStatus({ state: 'loaded', duration })
    } catch (e) {
      setChartStatus({ state: 'error', duration: performance.now() - start, error: String(e) })
    }
  }, [])

  const loadMarkdown = useCallback(async () => {
    setMdStatus({ state: 'loading', duration: 0 })
    const start = performance.now()
    try {
      const mod = await import('./heavy/markdown')
      const duration = performance.now() - start
      const html = mod.renderMarkdown(SAMPLE_MD)
      const toc = mod.extractToc(SAMPLE_MD)
      setMdResult(
        '--- TOC ---\n' +
        toc.map((t) => `${'  '.repeat(t.level - 1)}${t.text}`).join('\n') +
        '\n\n--- HTML ---\n' + html +
        `\n\nlib: ${mod.MARKDOWN_LIB_VERSION}`,
      )
      setMdStatus({ state: 'loaded', duration })
    } catch (e) {
      setMdStatus({ state: 'error', duration: performance.now() - start, error: String(e) })
    }
  }, [])

  const loadCsv = useCallback(async () => {
    setCsvStatus({ state: 'loading', duration: 0 })
    const start = performance.now()
    try {
      const mod = await import('./heavy/csv')
      const duration = performance.now() - start
      const result = mod.parseCsv(SAMPLE_CSV)
      const summary = mod.summarize(result)
      const rowsText = result.rows
        .map((r) => `  ${r.name} | ${r.age} | ${r.city} | ${r.role}`)
        .join('\n')
      setCsvResult(
        summary + '\n\n--- 数据 ---\n' + rowsText +
        `\n\nlib: ${mod.CSV_LIB_VERSION}`,
      )
      setCsvStatus({ state: 'loaded', duration })
    } catch (e) {
      setCsvStatus({ state: 'error', duration: performance.now() - start, error: String(e) })
    }
  }, [])

  return (
    <div className="page">
      <h2>按需加载演练 <span className="tag tag-info">点击触发 import()</span></h2>
      <p>
        三个重型模块（图表 / Markdown / CSV）默认不会下载。点击「加载」按钮，
        浏览器才会发起对应 chunk 的请求。打开 DevTools Network 面板可观察到新的 .js 请求。
      </p>

      <div className="modules-grid">
        <ModuleCard
          name="图表库 chart.ts"
          size="~180 KB"
          color="bg-chart"
          status={chartStatus}
          result={chartResult}
          onLoad={loadChart}
        />
        <ModuleCard
          name="Markdown 解析器 markdown.ts"
          size="~95 KB"
          color="bg-markdown"
          status={mdStatus}
          result={mdResult}
          onLoad={loadMarkdown}
        />
        <ModuleCard
          name="CSV 处理库 csv.ts"
          size="~70 KB"
          color="bg-csv"
          status={csvStatus}
          result={csvResult}
          onLoad={loadCsv}
        />
      </div>

      <div className="note">
        第二次点击同一按钮会「秒回」-- 因为模块一旦加载就会被浏览器缓存（HTTP 缓存 + 模块映射表缓存），
        重复 import() 不会再次发起网络请求。
      </div>
    </div>
  )
}

interface ModuleCardProps {
  name: string
  size: string
  color: string
  status: ModuleStatus
  result: string
  onLoad: () => void
}

const ModuleCard: FC<ModuleCardProps> = ({ name, size, color, status, result, onLoad }) => {
  const statusText =
    status.state === 'idle' ? '未加载' :
    status.state === 'loading' ? '加载中...' :
    status.state === 'loaded' ? `已加载 (${status.duration.toFixed(1)}ms)` :
    `失败: ${status.error}`

  return (
    <div className={'module-card ' + status.state}>
      <div className="head">
        <span className="name">{name}</span>
        <span className={'status ' + status.state}>{statusText}</span>
      </div>
      <div className="meta">
        模拟体积：{size} &nbsp;|&nbsp; 动态 import 后成为独立 chunk
      </div>
      <div>
        <button className="btn" onClick={onLoad} disabled={status.state === 'loading'}>
          {status.state === 'loading' && <span className="spinner" />}
          {status.state === 'idle' ? '加载模块' : status.state === 'loading' ? '加载中' : '重新执行'}
        </button>
      </div>
      {result && (
        <div className="result-box">{result}</div>
      )}
      {status.state === 'loaded' && (
        <div className="timing">
          首次加载耗时 <span className="num">{status.duration.toFixed(2)} ms</span>
          （含网络 + 解析 + 执行；开发模式下偏慢，生产环境会快很多）
        </div>
      )}
    </div>
  )
}

// ---- chunk 结构可视化 ----
const ChunkDiagram: FC = () => {
  const chunks: Array<{ name: string; color: string; size: string; loaded: boolean }> = [
    { name: 'main.js', color: 'bg-main', size: '~30 KB', loaded: true },
    { name: 'chart.js', color: 'bg-chart', size: '~180 KB', loaded: false },
    { name: 'markdown.js', color: 'bg-markdown', size: '~95 KB', loaded: false },
    { name: 'csv.js', color: 'bg-csv', size: '~70 KB', loaded: false },
  ]
  return (
    <div className="page">
      <h2>构建产物与加载边界 <span className="tag tag-info">visual</span></h2>
      <p>
        执行 <code>npm run build</code> 后，三个 heavy 模块各自成为独立 chunk。
        首屏只会加载 main.js，其余按用户操作触发。
      </p>

      <div className="diagram">
        <div className="diagram-title">dist/assets/ 产物（首屏视角）</div>
        <div className="bundle-row">
          <div className="bundle-box bg-vendor" style={{ flex: 1 }}>
            vendor.js
            <span className="size">react 等（必加载）</span>
          </div>
          <div className="bundle-box bg-main" style={{ flex: 1 }}>
            main.js
            <span className="size">~30 KB（必加载）</span>
          </div>
          <div className="bundle-box bg-chart" style={{ flex: 1, opacity: 0.4 }}>
            chart.js
            <span className="size">~180 KB（未加载）</span>
          </div>
          <div className="bundle-box bg-markdown" style={{ flex: 0.7, opacity: 0.4 }}>
            markdown.js
            <span className="size">~95 KB</span>
          </div>
          <div className="bundle-box bg-csv" style={{ flex: 0.6, opacity: 0.4 }}>
            csv.js
            <span className="size">~70 KB</span>
          </div>
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} />首屏必加载</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6', opacity: 0.4 }} />按需加载</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#64748b' }} />vendor</span>
        </div>
      </div>

      <h3>首屏体积对比</h3>
      <div className="compare">
        <div className="compare-col">
          <h4>不用 dynamic import：首屏全量</h4>
          <div className="bar-chart">
            <div className="bar" style={{ height: '20%', background: '#64748b' }} title="vendor" />
            <div className="bar" style={{ height: '12%', background: '#3b82f6' }} title="main" />
            <div className="bar" style={{ height: '95%', background: '#8b5cf6' }} title="chart" />
            <div className="bar" style={{ height: '52%', background: '#f59e0b' }} title="markdown" />
            <div className="bar" style={{ height: '40%', background: '#ef4444' }} title="csv" />
          </div>
          <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>首屏 ~375 KB</div>
        </div>
        <div className="compare-col">
          <h4>使用 dynamic import：首屏最小</h4>
          <div className="bar-chart">
            <div className="bar" style={{ height: '20%', background: '#64748b' }} title="vendor" />
            <div className="bar" style={{ height: '12%', background: '#3b82f6' }} title="main" />
            <div className="bar" style={{ height: '4%', background: '#e2e8f0' }} title="chart (lazy)" />
            <div className="bar" style={{ height: '4%', background: '#e2e8f0' }} title="markdown (lazy)" />
            <div className="bar" style={{ height: '4%', background: '#e2e8f0' }} title="csv (lazy)" />
          </div>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>首屏 ~110 KB（-71%）</div>
        </div>
      </div>
    </div>
  )
}

// ---- 与 React.lazy 的对比 ----
const Comparison: FC = () => {
  const rows: Array<{ aspect: string; lazy: string; dynamic: string }> = [
    { aspect: '抽象层级', lazy: '组件级（包装成组件）', dynamic: '模块级（任意模块）' },
    { aspect: '触发方式', lazy: '组件渲染', dynamic: '显式调用 import()' },
    { aspect: 'fallback', lazy: 'Suspense 自动处理', dynamic: '需手动管理 loading 状态' },
    { aspect: '典型场景', lazy: '路由 / 大组件', dynamic: '工具库 / 副作用模块 / 非组件代码' },
    { aspect: '底层依赖', lazy: '基于 import() + Suspense', dynamic: '原生 import() 语法' },
  ]
  return (
    <div className="page">
      <h2>动态 import() vs React.lazy <span className="tag tag-good">对比</span></h2>
      <p>
        React.lazy 本质上是对动态 import() 的封装，专门用于「组件」；而原生 import() 更通用，
        适合任意模块（工具函数、配置、副作用）。
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0' }}>维度</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0' }}>React.lazy</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0' }}>动态 import()</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.aspect} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r.aspect}</td>
              <td style={{ padding: '8px 10px', color: '#4b5563' }}>{r.lazy}</td>
              <td style={{ padding: '8px 10px', color: '#4b5563' }}>{r.dynamic}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>典型用法</h3>
      <pre className="code-block">{`// 场景一：组件按需加载 -> 用 React.lazy
const Editor = lazy(() => import('./Editor'))

// 场景二：工具库按需加载 -> 用 import()
async function exportPdf() {
  setLoading(true)
  const { exportToPdf } = await import('./pdf-exporter')
  await exportToPdf(data)
  setLoading(false)
}

// 场景三：条件加载 -> 用 import()
if (supportsWebGL) {
  const { init3D } = await import('./3d-renderer')
  init3D()
}`}</pre>
    </div>
  )
}

// ---- 拆分原则 ----
const Principles: FC = () => {
  const items: Array<{ title: string; body: ReactNode }> = [
    { title: '1. 体积门槛', body: '一般 > 30KB 且非首屏必需的模块才值得动态 import，否则拆分收益不及请求开销。' },
    { title: '2. 低频优先', body: '使用频率越低，越该按需加载；高频功能反而应进首屏避免重复等待。' },
    { title: '3. 错误处理', body: 'import() 可能失败（弱网/部署中），务必 try/catch 并提供重试入口。' },
    { title: '4. 预取策略', body: '对高概率使用的下一功能，可用 import() 在空闲时预取，让真正使用时零延迟。' },
    { title: '5. 状态管理', body: '手动管理 loading/error 状态较繁琐，可封装 hook 或直接用 React.lazy + Suspense。' },
    { title: '6. 避免循环', body: '动态 import 的模块若反向引用主包，可能产生循环依赖，应保持工具模块单向依赖。' },
  ]
  return (
    <div className="page">
      <h2>动态 import() 拆分原则</h2>
      <div className="info-grid">
        {items.map((it) => (
          <div className="info-card" key={it.title}>
            <div className="value">{it.title}</div>
            <div className="desc">{it.body}</div>
          </div>
        ))}
      </div>

      <div className="note">
        适用场景：图表 / 编辑器 / PDF 导出 / 文件解析 / 国际化语言包 / 大型 SDK 等重型、低频功能。
        这类模块动辄上百 KB，按需加载是性价比最高的拆分方式。
      </div>
    </div>
  )
}

export default App
