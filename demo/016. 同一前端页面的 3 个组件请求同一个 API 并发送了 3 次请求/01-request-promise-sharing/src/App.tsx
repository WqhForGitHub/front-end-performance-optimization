/**
 * 方案一：Promise 共享 / 请求去重
 *
 * 3 个组件（UserProfile / UserStats / UserActivity）各自独立调用
 * useSharedRequest('user', fetchUser)。由于 createRequestPromise 会复用
 * 进行中的 Promise，3 次调用只触发 1 次真实网络请求。
 *
 * 页面顶部展示“真实请求计数”，可点击“重新加载”重置并复现效果。
 */
import { useState, useEffect } from 'react'
import UserProfile from './components/UserProfile'
import UserStats from './components/UserStats'
import UserActivity from './components/UserActivity'
import { getRequestCount, resetRequestCount } from './api/mockApi'
import { clearRequestCache } from './utils/requestPromise'

export default function App() {
  const [requestCount, setRequestCount] = useState(getRequestCount())
  // 通过 key 强制子组件重新挂载，复现“3 组件同时请求”的过程
  const [reloadKey, setReloadKey] = useState(0)

  // 轮询读取真实请求计数，实时展示
  useEffect(() => {
    const timer = setInterval(() => {
      setRequestCount(getRequestCount())
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const handleReload = () => {
    resetRequestCount()
    clearRequestCache()
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
    backgroundColor: '#fff8e1',
    border: '1px solid #ffe082',
    borderRadius: '12px',
  }

  const counterTextStyle: Record<string, string | number | undefined> = {
    fontSize: '15px',
    color: '#5d4037',
  }

  const countBadgeStyle: Record<string, string | number | undefined> = {
    display: 'inline-block',
    minWidth: '28px',
    padding: '2px 10px',
    margin: '0 4px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#e65100',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #ffcc80',
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
        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>方案一：Promise 共享 / 请求去重</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          3 个组件请求同一个 API，共享进行中的 Promise，只发 1 次请求
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
        <strong>原理：</strong>用 Map 按 key 缓存“进行中（in-flight）的 Promise”。
        第一个组件调用时执行真实请求并存入缓存；后续相同 key 的组件直接复用同一个
        Promise，不再发起请求。Promise 完成后移除缓存，不影响后续刷新。
      </div>

      <div style={gridStyle} key={reloadKey}>
        <UserProfile />
        <UserStats />
        <UserActivity />
      </div>
    </div>
  )
}
