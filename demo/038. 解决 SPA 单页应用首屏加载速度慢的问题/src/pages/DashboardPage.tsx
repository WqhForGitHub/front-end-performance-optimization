export default function DashboardPage() {
  const stats = [
    { label: '活跃用户', value: '12.8万', color: '#3b82f6' },
    { label: '日均访问', value: '8.9万', color: '#10b981' },
    { label: '满意度', value: '98%', color: '#f59e0b' },
    { label: '响应时间', value: '120ms', color: '#8b5cf6' },
  ]

  return (
    <div style={containerStyle}>
      <h2 style={h2Style}>数据仪表盘（懒加载）</h2>
      <p style={descStyle}>本页面通过 React.lazy 懒加载，含数据可视化组件。</p>

      <div style={gridStyle}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...cardStyle, borderTopColor: s.color }}>
            <div style={{ ...valueStyle, color: s.color }}>{s.value}</div>
            <div style={labelStyle}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={chartStyle}>
        <h3 style={h3Style}>访问趋势（模拟）</h3>
        <div style={barsStyle}>
          {[40, 65, 80, 55, 90, 75, 100, 85, 70, 95, 60, 88].map((h, i) => (
            <div
              key={i}
              style={{
                height: `${h}%`,
                background: 'linear-gradient(180deg, #3b82f6, #93c5fd)',
                flex: 1,
                borderRadius: '4px 4px 0 0',
                minWidth: 16,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = { padding: 0 }
const h2Style: React.CSSProperties = { margin: '0 0 16px', color: '#3b82f6', fontSize: 20 }
const descStyle: React.CSSProperties = { margin: '0 0 24px', color: '#6b7280', fontSize: 14 }
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 16,
  marginBottom: 24,
}
const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderTopWidth: 4,
  borderRadius: 8,
}
const valueStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700 }
const labelStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', marginTop: 4 }
const chartStyle: React.CSSProperties = {
  padding: 20,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = { margin: '0 0 16px', color: '#3b82f6', fontSize: 15 }
const barsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  height: 160,
  alignItems: 'flex-end',
}
