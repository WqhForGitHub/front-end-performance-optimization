/**
 * 方案二：Context 状态提升
 *
 * 把请求逻辑提升到 DataProvider 顶层，只发 1 次请求，
 * 通过 Context 将数据分发给 3 个子组件（UserProfile / UserStats / UserActivity）。
 * 子组件用 useContext 读取同一份数据，不再各自发请求。
 *
 * 页面顶部展示“真实请求计数”，点击“重新加载”可重置并复现。
 */
import { useState, useEffect } from 'react'
import { DataProvider } from './context/DataContext'
import UserProfile from './components/UserProfile'
import UserStats from './components/UserStats'
import UserActivity from './components/UserActivity'
import { getRequestCount, resetRequestCount } from './api/mockApi'

export default function App() {
  const [requestCount, setRequestCount] = useState(getRequestCount())
  // 通过 key 让 DataProvider 重新挂载，复现“顶层只请求一次”的过程
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setRequestCount(getRequestCount())
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const handleReload = () => {
    resetRequestCount()
    setRequestCount(0)
    setReloadKey((k) => k + 1)
  }

  const pageStyle: Record<string, string | number | undefined> = {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const counterBoxStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
  }

  const counterTextStyle: Record<string, string | number | undefined> = {
    fontSize: '15px',
    color: '#1b5e20',
  }

  const countBadgeStyle: Record<string, string | number | undefined> = {
    display: 'inline-block',
    minWidth: '28px',
    padding: '2px 10px',
    margin: '0 4px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#2e7d32',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
    textAlign: 'center',
  }

  const buttonStyle: Record<string, string | number | undefined> = {
    padding: '8px 20px',
    fontSize: '14px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }

  const descStyle: Record<string, string | number | undefined> = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const gridStyle: Record<string, string | number | undefined> = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>
          方案二：Context 状态提升
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          请求提升到 Provider 顶层只发 1 次，子组件通过 Context 共享数据
        </p>
      </div>

      <div style={counterBoxStyle}>
        <div style={counterTextStyle}>
          真实网络请求次数：
          <span style={countBadgeStyle}>{requestCount}</span>
          次（未优化时为 3 次）
        </div>
        <button style={buttonStyle} onClick={handleReload}>
          重新加载
        </button>
      </div>

      <div style={descStyle}>
        <strong>原理：</strong>将“请求 + 数据状态”提升到共同的 <code>DataProvider</code>，
        在 Provider 内部用 <code>useEffect</code> 只发起 1 次请求，再通过 Context 向下分发。
        3 个子组件用 <code>useContext</code> 读取同一份数据，天然不会重复请求。
      </div>

      <div key={reloadKey}>
        <DataProvider>
          <div style={gridStyle}>
            <UserProfile />
            <UserStats />
            <UserActivity />
          </div>
        </DataProvider>
      </div>
    </div>
  )
}
