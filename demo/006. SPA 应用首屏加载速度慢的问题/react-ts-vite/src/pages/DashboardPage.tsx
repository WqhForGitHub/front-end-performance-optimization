import { useMemo } from 'react'

/** 模拟仪表盘页 - 包含图表模拟数据 */
export default function DashboardPage() {
  const stats = useMemo(() => {
    const items: { id: number; label: string; value: number; trend: string }[] = []
    const labels = ['总用户数', '日活跃用户', '页面访问量', '平均加载时间', '错误率', '转化率']
    for (let i = 0; i < labels.length; i++) {
      const value = Math.round(Math.random() * 10000)
      items.push({
        id: i,
        label: labels[i],
        value: value,
        trend: value > 5000 ? '↑' : '↓',
      })
    }
    return items
  }, [])

  return (
    <div>
      <h3 style={{ marginBottom: '12px' }}>数据仪表盘</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.id}
            style={{
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace' }}>
              {stat.value}
              <span
                style={{
                  fontSize: '12px',
                  color: stat.trend === '↑' ? '#52c41a' : '#ff4d4f',
                  marginLeft: '4px',
                }}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '6px',
          height: '150px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
        }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${20 + Math.random() * 80}%`,
              background: `hsl(${210 + i * 3}, 70%, ${50 + i}%)`,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </div>
  )
}
