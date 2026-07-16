/**
 * 用户统计组件
 * 通过 useContext(useData) 读取共享数据，自身不发请求
 */
import { useData } from '../context/DataContext'

export default function UserStats() {
  const { data, loading, error } = useData()

  const cardStyle: Record<string, string | number | undefined> = {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fff',
  }

  const titleStyle: Record<string, string | number | undefined> = {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#1976d2',
    borderBottom: '1px solid #e3f2fd',
    paddingBottom: '8px',
  }

  const statGridStyle: Record<string, string | number | undefined> = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  }

  const statItemStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    padding: '12px 8px',
    backgroundColor: '#f5f9ff',
    borderRadius: '8px',
  }

  const statValueStyle: Record<string, string | number | undefined> = {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1976d2',
    margin: '0 0 4px 0',
  }

  const statLabelStyle: Record<string, string | number | undefined> = {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  }

  const hintStyle: Record<string, string | number | undefined> = {
    fontSize: '12px',
    color: '#999',
    marginTop: '12px',
    fontStyle: 'italic',
  }

  const stats = data
    ? [
        { label: '关注者', value: data.stats.followers },
        { label: '正在关注', value: data.stats.following },
        { label: '发布文章', value: data.stats.posts },
      ]
    : []

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>组件 B · 用户统计（UserStats）</h3>
      {loading && <div style={{ color: '#888' }}>加载中...</div>}
      {error && <div style={{ color: 'red' }}>出错了：{error.message}</div>}
      {data && (
        <div style={statGridStyle}>
          {stats.map((s) => (
            <div key={s.label} style={statItemStyle}>
              <p style={statValueStyle}>{s.value}</p>
              <p style={statLabelStyle}>{s.label}</p>
            </div>
          ))}
        </div>
      )}
      <div style={hintStyle}>本组件通过 useContext 读取共享数据</div>
    </div>
  )
}
