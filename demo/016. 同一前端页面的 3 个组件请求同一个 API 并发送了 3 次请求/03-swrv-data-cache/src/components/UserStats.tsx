/**
 * 用户统计组件
 * 使用 useSWR('user', fetchUser) 读取全局缓存数据，与其它组件共享同一份缓存
 */
import { useSWR } from '../hooks/useSWR'
import { fetchUser, UserData } from '../api/mockApi'

export default function UserStats() {
  const { data, loading, error, isValidating } = useSWR<UserData>(
    'user',
    fetchUser,
    { dedupingInterval: 5000 },
  )

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  const badgeStyle: Record<string, string | number | undefined> = {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: isValidating ? '#fff3e0' : '#e8f5e9',
    color: isValidating ? '#e65100' : '#2e7d32',
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
      <h3 style={titleStyle}>
        <span>组件 B · 用户统计</span>
        {data && <span style={badgeStyle}>{isValidating ? '验证中' : '已缓存'}</span>}
      </h3>
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
      <div style={hintStyle}>useSWR('user') 共享全局缓存</div>
    </div>
  )
}
