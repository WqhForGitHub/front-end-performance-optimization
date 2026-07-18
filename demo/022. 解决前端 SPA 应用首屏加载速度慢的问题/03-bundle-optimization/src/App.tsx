import type { FC } from 'react'
import { ViteConfigExample } from './components/ViteConfigExample'
import { TreeShakingDemo } from './components/TreeShakingDemo'
import {
  BundleTable,
  baselineRows,
  manualChunksRows,
  cdnExternalsRows,
} from './components/BundleAnalysis'

const App: FC = () => {
  const baselineTotal = baselineRows.reduce((s, r) => s + r.sizeKB, 0)
  const manualTotal = manualChunksRows.reduce((s, r) => s + r.sizeKB, 0)
  const cdnTotal = cdnExternalsRows.reduce((s, r) => s + r.sizeKB, 0)
  const baselineGzip = baselineRows.reduce((s, r) => s + r.gzipKB, 0)
  const cdnGzip = cdnExternalsRows.reduce((s, r) => s + r.gzipKB, 0)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>方案三：构建产物优化（manualChunks + CDN externals + tree shaking）</h1>
        <span className="badge">SPA 首屏优化 Demo</span>
      </header>

      <div className="section">
        <h2>0. 三阶段产物体积对比</h2>
        <div className="desc">
          下表展示同一应用在三种构建策略下的 chunk 分布与总体积变化（数值为典型场景估算）。
        </div>

        <div className="kpi-row">
          <div className="kpi">
            <div className="label">基线（单 bundle）</div>
            <div className="value">{baselineTotal} KB</div>
            <div className="delta up">gzip {baselineGzip} KB</div>
          </div>
          <div className="kpi">
            <div className="label">+ manualChunks</div>
            <div className="value">{manualTotal} KB</div>
            <div className="delta down">
              -{Math.round((1 - manualTotal / baselineTotal) * 100)}%（vendor 可长期缓存）
            </div>
          </div>
          <div className="kpi">
            <div className="label">+ CDN externals</div>
            <div className="value">{cdnTotal} KB</div>
            <div className="delta down">
              -{Math.round((1 - cdnTotal / baselineTotal) * 100)}%（gzip {cdnGzip} KB）
            </div>
          </div>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}
        >
          <BundleTable title="基线" rows={baselineRows} showTotal={true} />
          <BundleTable title="+ manualChunks" rows={manualChunksRows} showTotal={true} />
          <BundleTable title="+ CDN externals" rows={cdnExternalsRows} showTotal={true} />
        </div>

        <div className="tip">
          关键收益：首屏 chunk 从 320KB 降到 95KB（仅业务 + lodash）， 且 vendor-react /
          vendor-lodash 文件名带 hash，可被浏览器长期缓存， 后续发版仅需重新下载 main.js。
        </div>
      </div>

      <ViteConfigExample />

      <TreeShakingDemo />
    </div>
  )
}

export default App
