/**
 * 用户资料组件
 * 独立调用 useSharedRequest('user', fetchUser)
 */
import { useSharedRequest } from '../hooks/useSharedRequest'
import { fetchUser, UserData } from '../api/mockApi'

export default function UserProfile() {
  const { data, loading, error } = useSharedRequest<UserData>('user', fetchUser)

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

  const hintStyle: Record<string, string | number | undefined> = {
    fontSize: '12px',
    color: '#999',
    marginTop: '10px',
    fontStyle: 'italic',
  }

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>组件 A · 用户资料（UserProfile）</h3>
      {loading && <div style={{ color: '#888' }}>加载中...</div>}
      {error && <div style={{ color: 'red' }}>出错了：{error.message}</div>}
      {data && (
        <div>
          <p style={nameStyle}>{data.name}</p>
          <p style={roleStyle}>{data.role}</p>
        </div>
      )}
      <div style={hintStyle}>本组件独立调用了 useSharedRequest('user')</div>
    </div>
  )
}
