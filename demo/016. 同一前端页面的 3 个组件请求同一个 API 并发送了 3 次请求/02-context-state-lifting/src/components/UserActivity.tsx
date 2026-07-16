/**
 * 用户动态组件
 * 通过 useContext(useData) 读取共享数据，自身不发请求
 */
import { useData } from '../context/DataContext'

export default function UserActivity() {
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

  const hintStyle: Record<string, string | number | undefined> = {
    fontSize: '12px',
    color: '#999',
    marginTop: '12px',
    fontStyle: 'italic',
  }

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>组件 C · 用户动态（UserActivity）</h3>
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
      <div style={hintStyle}>本组件通过 useContext 读取共享数据</div>
    </div>
  )
}
