import { useState, useEffect, useMemo } from 'react'

// 模拟 Dashboard 内部使用的数据，制造一些「体积」感
const KPI_LIST = [
  { label: '日活用户', value: 12834, delta: '+12.4%' },
  { label: '订单数', value: 3821, delta: '+5.1%' },
  { label: 'GMV (元)', value: 928310, delta: '+18.7%' },
  { label: '转化率', value: 0.0382, delta: '-1.2%' },
]

const CHART_DATA = [32, 45, 38, 52, 48, 61, 55, 70, 63, 78, 72, 85]

export default function Dashboard() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const max = useMemo(() => Math.max(...CHART_DATA), [])
  const scale = range === '7d' ? 0.4 : range === '30d' ? 0.7 : 1

  return (
    <div className="page">
      <h2>
        Dashboard 数据看板 <span className="tag tag-load">lazy chunk</span>
      </h2>
      <p>
        Dashboard 通常依赖图表库与大量数据展示逻辑，体积较大。将其拆成独立 chunk，
        可以让首屏（Home）不必等待图表代码下载完成。
      </p>

      <div className="diagram">
        <div className="diagram-title">本页 chunk 的依赖关系</div>
        <div className="flow">
          <span className="bundle-box bg-vendor" style={{ minWidth: 80 }}>
            vendor
          </span>
          <span className="flow-arrow">-&gt;</span>
          <span className="bundle-box bg-dashboard" style={{ minWidth: 110 }}>
            Dashboard.js
          </span>
          <span className="flow-arrow">-&gt;</span>
          <span style={{ color: '#475569' }}>渲染图表 / KPI</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          vendor 已在首屏加载并缓存，Dashboard 只需下载自身业务代码。
        </div>
      </div>

      <div className="info-grid">
        {KPI_LIST.map((kpi) => (
          <div className="info-card" key={kpi.label}>
            <div className="label">{kpi.label}</div>
            <div className="value">
              {typeof kpi.value === 'number' && kpi.value > 1000
                ? kpi.value.toLocaleString()
                : kpi.value}
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: kpi.delta.startsWith('-') ? '#ef4444' : '#10b981',
                }}
              >
                {kpi.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h3>访问趋势（模拟柱状图）</h3>
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'flex-end',
          height: 120,
          padding: '12px 0',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s',
        }}
      >
        {CHART_DATA.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / max) * 100 * scale}%`,
              background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.6s',
            }}
            title={`第 ${i + 1} 月: ${v}k`}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {(['7d', '30d', '90d'] as const).map((r) => (
          <button
            key={r}
            className={'nav-btn' + (range === r ? ' active' : '')}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="note">
        若 Dashboard 真的引入了 echarts/antv 等图表库，本 chunk 可能超过 200KB。 通过路由级
        lazy，未访问 Dashboard 的用户完全不必下载这些代码。
      </div>
    </div>
  )
}
