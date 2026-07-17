import type { FC, ReactNode } from 'react'
import {
  singleBundleChunks,
  splitBundleChunks,
  type ChunkInfo
} from '../router'

const MAX_KB = 340 // 单 bundle 320KB 为基准刻度

// 用「渲染函数」而非自定义组件，避免在 list 中给自定义组件传 key 时
// 触发 fallback 类型声明的 props 类型检查问题。
const renderChunkBar = (info: ChunkInfo, good: boolean): ReactNode => {
  const pct = Math.min(100, (info.sizeKB / MAX_KB) * 100)
  return (
    <div className="chunk-item">
      <span className="chunk-name">
        {info.name}
        {info.lazy ? <span style={{ color: '#9ca3af' }}>（按需加载）</span> : null}
      </span>
      <span className="chunk-size">{info.sizeKB} KB</span>
      <div className="bar" style={{ width: '100%', marginTop: 4 }}>
        <div
          className={good ? 'bar-fill good' : 'bar-fill bad'}
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  )
}

export const BundleSizeComparison: FC = () => {
  const singleTotal = singleBundleChunks.reduce((s, c) => s + c.sizeKB, 0)
  const splitInitial = splitBundleChunks
    .filter((c) => !c.lazy)
    .reduce((s, c) => s + c.sizeKB, 0)
  const splitTotal = splitBundleChunks.reduce((s, c) => s + c.sizeKB, 0)

  return (
    <div>
      <h3>Bundle 体积对比（首屏只需下载的 chunk）</h3>

      <div className="compare-grid">
        <div className="compare-card bad">
          <div className="label">优化前：单 bundle</div>
          <div className="value">{singleTotal} KB</div>
          <div className="bar">
            <div className="bar-fill bad" style={{ width: '100%' }} />
          </div>
          <div className="chunk-list">
            {singleBundleChunks.map((c) => (
              <div key={c.name}>{renderChunkBar(c, false)}</div>
            ))}
          </div>
          <div className="metric-row">
            <span className="metric-pill">首屏下载 <b>{singleTotal} KB</b></span>
            <span className="metric-pill">chunk 数量 <b>1</b></span>
          </div>
        </div>

        <div className="compare-card good">
          <div className="label">优化后：路由级拆分</div>
          <div className="value">{splitInitial} KB（首屏）</div>
          <div className="bar">
            <div
              className="bar-fill good"
              style={{ width: (splitInitial / MAX_KB) * 100 + '%' }}
            />
          </div>
          <div className="chunk-list">
            {splitBundleChunks.map((c) => (
              <div key={c.name}>{renderChunkBar(c, true)}</div>
            ))}
          </div>
          <div className="metric-row">
            <span className="metric-pill">首屏下载 <b>{splitInitial} KB</b></span>
            <span className="metric-pill">总产物 <b>{splitTotal} KB</b></span>
            <span className="metric-pill">chunk 数量 <b>{splitBundleChunks.length}</b></span>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 12, color: '#4b5563', fontSize: 13 }}>
        首屏体积从 <b>{singleTotal} KB</b> 下降到 <b>{splitInitial} KB</b>，
        降幅 <b>{Math.round((1 - splitInitial / singleTotal) * 100)}%</b>；
        其他路由 chunk 仅在用户点击对应路由时才下载。
      </p>
    </div>
  )
}
