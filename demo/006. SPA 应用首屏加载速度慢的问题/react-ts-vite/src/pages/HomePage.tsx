import { useMemo } from 'react'

/** 模拟首页 - 包含一些计算量用于模拟"重"组件 */
export default function HomePage() {
  const data = useMemo(() => {
    // 模拟数据处理
    const items: { id: number; title: string; value: number }[] = []
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        title: `首页内容 ${i + 1}`,
        value: Math.round(Math.random() * 1000),
      })
    }
    return items
  }, [])

  return (
    <div>
      <h3 style={{ marginBottom: '12px' }}>首页</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
            <div style={{ color: '#999' }}>数值: {item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
