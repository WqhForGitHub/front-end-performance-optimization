import { useState, type CSSProperties } from 'react'
import { flowSteps } from '../data/directives'

const nodeStyle: Record<string, CSSProperties> = {
  start: { background: '#e0e7ff', borderColor: '#6366f1', color: '#3730a3' },
  decision: { background: '#fef9c3', borderColor: '#ca8a04', color: '#713f12' },
  action: { background: '#e0f2fe', borderColor: '#0284c7', color: '#075985' },
  'end-hit': { background: '#dcfce7', borderColor: '#16a34a', color: '#14532d' },
  'end-miss': { background: '#fee2e2', borderColor: '#dc2626', color: '#7f1d1d' },
}

const nodeLabel: Record<string, string> = {
  start: '起点',
  decision: '判断',
  action: '动作',
  'end-hit': '命中',
  'end-miss': '未命中',
}

/** 简化的浏览器缓存决策路径：根据用户选择的场景高亮走哪条分支 */
type Scenario = 'normal' | 'fresh' | 'expired' | 'noCache' | 'noStore' | 'immutable'

const scenarios: { key: Scenario; label: string; path: string[]; desc: string }[] = [
  {
    key: 'fresh',
    label: '强缓存命中 (未过期)',
    desc: '本地有副本且 max-age 未过期，直接使用，不发请求',
    path: ['req', 'store', 'noStore', 'fresh', 'hit'],
  },
  {
    key: 'expired',
    label: '协商缓存 (已过期)',
    desc: '本地副本过期，发协商请求，服务器确认未改返回 304',
    path: ['req', 'store', 'noStore', 'fresh', 'revalidate', '304', 'use304'],
  },
  {
    key: 'noCache',
    label: 'no-cache 总是校验',
    desc: '响应标记 no-cache，每次必须协商，命中则 304',
    path: ['req', 'store', 'noStore', 'fresh', 'revalidate', '304', 'use304'],
  },
  {
    key: 'immutable',
    label: 'immutable 强刷新也命中',
    desc: '带 immutable 且未过期，即使用户按 F5 也不发请求',
    path: ['req', 'store', 'noStore', 'fresh', 'immutable', 'hit'],
  },
  {
    key: 'noStore',
    label: 'no-store 完全不缓存',
    desc: '响应禁止存储，每次都完整下载',
    path: ['req', 'store', 'noStore', 'fetch'],
  },
  {
    key: 'normal',
    label: '服务器已更新',
    desc: '协商请求后服务器返回新内容 200',
    path: ['req', 'store', 'noStore', 'fresh', 'revalidate', '304', 'fetch'],
  },
]

export default function CacheFlowDiagram() {
  const [active, setActive] = useState<Scenario>('fresh')
  const current = scenarios.find((s) => s.key === active)!
  const pathSet = new Set(current.path)

  return (
    <section className="card">
      <div className="card-head">
        <h2>浏览器缓存决策流程</h2>
        <p>
          当浏览器要加载一个资源时，会按下面的流程判断是直接用本地副本、协商校验还是重新下载。点击下方按钮查看不同场景下走过的分支。
        </p>
      </div>

      <div className="scenario-bar">
        {scenarios.map((s) => (
          <button
            key={s.key}
            className="chip"
            style={
              active === s.key
                ? { background: '#1e293b', color: '#fff', borderColor: '#1e293b' }
                : {}
            }
            onClick={() => setActive(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="scenario-desc">
        <strong>当前场景：</strong>
        <span>{current.desc}</span>
      </div>

      <div className="flow-grid">
        {flowSteps.map((node, idx) => {
          const onPath = pathSet.has(node.id)
          const st = nodeStyle[node.type]
          return (
            <div key={node.id} className={`flow-node ${onPath ? 'on-path' : 'off-path'}`}>
              <div className="flow-index">#{idx + 1}</div>
              <div
                className="flow-box"
                style={{
                  background: onPath ? st.background : '#f8fafc',
                  borderColor: onPath ? st.borderColor : '#e2e8f0',
                  color: onPath ? st.color : '#94a3b8',
                }}
              >
                <div className="flow-type">{nodeLabel[node.type]}</div>
                <div className="flow-label">{node.label}</div>
                {node.note ? <div className="flow-note">{node.note}</div> : null}
              </div>
              {onPath && idx < flowSteps.length - 1 && pathSet.has(flowSteps[idx + 1].id) ? (
                <div className="flow-arrow">↓</div>
              ) : (
                <div className="flow-arrow off">↓</div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
