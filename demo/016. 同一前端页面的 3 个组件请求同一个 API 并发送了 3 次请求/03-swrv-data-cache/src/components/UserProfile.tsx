/**
 * 用户资料组件
 * 使用 useSWR('user', fetchUser) 读取全局缓存数据
 * 多个组件用同一 key，首屏只发 1 次请求；有缓存时先显示旧数据再后台更新
 */
import { useSWR } from '../hooks/useSWR'
import { fetchUser, UserData } from '../api/mockApi'

export default function UserProfile() {
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

  const nameStyle: Record<string, string | number | undefined> = {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 6px 0',
  }

  const roleStyle: Record<string, string | number | undefined> = {
    color: '#666',
    fontSize: '14px',
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
    marginTop: '10px',
    fontStyle: 'italic',
  }

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>
        <span>组件 A · 用户资料</span>
        {data && <span style={badgeStyle}>{isValidating ? '验证中' : '已缓存'}</span>}
      </h3>
      {loading && <div style={{ color: '#888' }}>加载中...</div>}
      {error && <div style={{ color: 'red' }}>出错了：{error.message}</div>}
      {data && (
        <div>
          <p style={nameStyle}>{data.name}</p>
          <p style={roleStyle}>{data.role}</p>
        </div>
      )}
      <div style={hintStyle}>useSWR('user') 共享全局缓存</div>
    </div>
  )
}
