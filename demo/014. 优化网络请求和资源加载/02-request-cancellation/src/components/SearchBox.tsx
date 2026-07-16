import { useState, useCallback } from 'react'
import { useDebouncedFetch } from '../hooks/useDebouncedFetch'

interface User {
  id: number
  name: string
  email: string
  phone: string
}

/**
 * 搜索框组件
 *
 * 演示防抖 + 请求取消：
 * 1. 用户快速输入时，使用防抖延迟发送请求
 * 2. 新请求发出前取消上一个未完成的请求
 * 3. 显示被取消的请求次数，直观展示优化效果
 */
export default function SearchBox() {
  const [query, setQuery] = useState('')
  const { data, loading, error, cancelCount } = useDebouncedFetch<User[]>(query, 600)

  const handleChange = useCallback((e: { target: { value: string } }) => {
    setQuery(e.target.value)
  }, [])

  const containerStyle: Record<string, string | number | undefined> = {
    maxWidth: '600px',
    margin: '0 auto',
  }

  const inputStyle: Record<string, string | number | undefined> = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const statsStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '16px',
    margin: '12px 0',
    fontSize: '13px',
  }

  const statItemStyle: Record<string, string | number | undefined> = {
    padding: '4px 12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    color: '#666',
  }

  const resultStyle: Record<string, string | number | undefined> = {
    marginTop: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  }

  const userCardStyle: Record<string, string | number | undefined> = {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const loadingStyle: Record<string, string | number | undefined> = {
    padding: '24px',
    textAlign: 'center',
    color: '#999',
  }

  const emptyStyle: Record<string, string | number | undefined> = {
    padding: '24px',
    textAlign: 'center',
    color: '#999',
  }

  return (
    <div style={containerStyle}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="输入关键词搜索用户（快速输入查看取消效果）..."
        style={inputStyle}
        autoFocus
      />

      <div style={statsStyle}>
        <span style={statItemStyle}>
          已取消请求: <strong style={{ color: '#f44336' }}>{cancelCount}</strong>
        </span>
        <span style={statItemStyle}>
          状态:{' '}
          <strong style={{ color: loading ? '#ff9800' : '#4caf50' }}>
            {loading ? '请求中...' : '空闲'}
          </strong>
        </span>
        <span style={statItemStyle}>
          防抖延迟: <strong>600ms</strong>
        </span>
      </div>

      <div style={resultStyle}>
        {loading && <div style={loadingStyle}>正在搜索...</div>}
        {error && <div style={{ ...loadingStyle, color: '#f44336' }}>错误: {error.message}</div>}
        {!loading && !error && data && data.length === 0 && (
          <div style={emptyStyle}>未找到匹配的用户</div>
        )}
        {!loading && !error && data && data.length > 0 && (
          <div>
            {data.slice(0, 10).map((user) => (
              <div key={user.id} style={userCardStyle}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#bbb' }}>#{user.id}</div>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && !data && (
          <div style={emptyStyle}>请输入关键词开始搜索</div>
        )}
      </div>
    </div>
  )
}
