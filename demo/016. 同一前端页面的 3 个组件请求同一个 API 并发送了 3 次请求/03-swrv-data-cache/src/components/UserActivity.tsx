/**
 * 用户动态组件
 * 使用 useSWR('user', fetchUser) 读取全局缓存数据，与其它组件共享同一份缓存
 */
import { useSWR } from '../hooks/useSWR'
import { fetchUser, UserData } from '../api/mockApi'

export default function UserActivity() {
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

  const listStyle: Record<string, string | number | undefined> = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  }

  const itemStyle: Record<string, string | number | undefined> = {
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#333',
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

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>
        <span>组件 C · 用户动态</span>
        {data && <span style={badgeStyle}>{isValidating ? '验证中' : '已缓存'}</span>}
      </h3>
      {loading && <div style={{ color: '#888' }}>加载中...</div>}
      {error && <div style={{ color: 'red' }}>出错了：{error.message}</div>}
      {data && (
        <ul style={listStyle}>
          {data.activity.map((item, idx) => (
            <li key={idx} style={itemStyle}>
              {item}
            </li>
          ))}
        </ul>
      )}
      <div style={hintStyle}>useSWR('user') 共享全局缓存</div>
    </div>
  )
}
