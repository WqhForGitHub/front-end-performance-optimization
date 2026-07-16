import type { User, FetchResult } from '../utils/api'

interface DataGridProps {
  result: FetchResult | null
  loading: boolean
}

/**
 * 数据网格组件
 *
 * 展示请求结果和性能数据：
 * - 用户列表
 * - 加载耗时
 * - 请求模式
 */
export default function DataGrid({ result, loading }: DataGridProps) {
  const containerStyle: Record<string, string | number | undefined> = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  }

  const headerStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
  }

  const modeLabels: Record<string, string> = {
    sequential: '顺序请求',
    batch: '批量请求',
    concurrent: '并发限制',
  }

  const modeColors: Record<string, string> = {
    sequential: '#f44336',
    batch: '#4caf50',
    concurrent: '#ff9800',
  }

  const tableStyle: Record<string, string | number | undefined> = {
    width: '100%',
    borderCollapse: 'collapse',
  }

  const thStyle: Record<string, string | number | undefined> = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '13px',
    color: '#999',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
  }

  const tdStyle: Record<string, string | number | undefined> = {
    padding: '10px 16px',
    fontSize: '14px',
    borderBottom: '1px solid #f0f0f0',
  }

  const loadingStyle: Record<string, string | number | undefined> = {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{ marginBottom: '8px', fontSize: '16px' }}>正在加载...</div>
          <div style={{ fontSize: '13px', color: '#bbb' }}>请求数据中，请稍候</div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>点击上方按钮开始加载数据</div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: modeColors[result.mode],
            }}
          >
            {modeLabels[result.mode]}
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            共 {result.users.length} 条数据
          </span>
        </div>
        <div style={{ fontSize: '14px' }}>
          耗时: <strong style={{ color: modeColors[result.mode] }}>{result.duration.toFixed(0)}ms</strong>
        </div>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>姓名</th>
            <th style={thStyle}>邮箱</th>
            <th style={thStyle}>公司</th>
          </tr>
        </thead>
        <tbody>
          {result.users.map((user: User) => (
            <tr key={user.id}>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.name}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
