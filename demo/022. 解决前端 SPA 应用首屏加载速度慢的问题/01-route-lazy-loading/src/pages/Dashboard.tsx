import { useState, type FC } from 'react'

// 一个有真实体积的页面（包含本地状态 + 列表渲染），让 chunk 体积接近真实场景
export const Dashboard: FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')

  const data: Record<typeof range, number[]> = {
    '7d': [120, 200, 150, 80, 70, 110, 130],
    '30d': [890, 760, 920, 870, 810, 700, 930, 880, 910, 850, 790, 940, 870, 920, 880, 850, 790, 940, 870, 920, 880, 850, 790, 940, 870, 920, 880, 850, 790, 940],
    '90d': new Array(90).fill(0).map((_, i) => 600 + Math.round(Math.sin(i / 5) * 200 + i))
  }

  const max = Math.max(...data[range])
  const avg = Math.round(data[range].reduce((s, n) => s + n, 0) / data[range].length)

  return (
    <div>
      <h2>仪表盘 Dashboard</h2>
      <p>该页面通过 <code>React.lazy</code> 异步加载，独立成一个 chunk。</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['7d', '30d', '90d'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            style={{
              padding: '4px 12px',
              border: '1px solid #d1d5db',
              background: r === range ? '#6366f1' : '#fff',
              color: r === range ? '#fff' : '#4b5563',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, padding: '8px 0' }}>
        {data[range].slice(0, 30).map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: (v / max) * 100 + '%',
              background: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)',
              borderRadius: '2px 2px 0 0',
              minHeight: 4
            }}
            title={String(v)}
          />
        ))}
      </div>

      <div style={{ marginTop: 12, color: '#4b5563', fontSize: 13 }}>
        区间均值：<b style={{ color: '#6366f1' }}>{avg}</b>，最大值：<b>{max}</b>
      </div>
    </div>
  )
}

export default Dashboard
