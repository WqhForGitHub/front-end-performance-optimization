/**
 * 方案三：SWR 数据缓存（Stale-While-Revalidate）
 *
 * 3 个组件（UserProfile / UserStats / UserActivity）各自调用
 * useSWR('user', fetchUser)。由于 useSWR 内部维护模块级全局 cache，
 * 相同 key 的并发调用会共享 in-flight Promise，首屏只发 1 次请求。
 *
 * 此外，已有缓存时先返回旧数据（stale），同时后台重新验证（revalidate），
 * 拿到新数据后静默更新 —— 点击“后台刷新”可观察这一过程。
 *
 * 页面顶部展示“真实请求计数”。
 */
import { useState, useEffect } from 'react'
import UserProfile from './components/UserProfile'
import UserStats from './components/UserStats'
import UserActivity from './components/UserActivity'
import { getRequestCount, resetRequestCount, fetchUser } from './api/mockApi'
import { clearSWRCache, mutate } from './hooks/useSWR'

export default function App() {
  const [requestCount, setRequestCount] = useState(getRequestCount())
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setRequestCount(getRequestCount())
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // 重新加载：清空缓存 + 重置计数 + 重新挂载子组件
  const handleReload = () => {
    resetRequestCount()
    clearSWRCache()
    setRequestCount(0)
    setReloadKey((k) => k + 1)
  }

  // 后台刷新：不清缓存，先用旧数据渲染，后台发起新请求（stale-while-revalidate）
  const handleRevalidate = () => {
    mutate('user', fetchUser)
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
    backgroundColor: '#ede7f6',
    border: '1px solid #b39ddb',
    borderRadius: '12px',
  }

  const counterTextStyle: Record<string, string | number | undefined> = {
    fontSize: '15px',
    color: '#311b92',
  }

  const countBadgeStyle: Record<string, string | number | undefined> = {
    display: 'inline-block',
    minWidth: '28px',
    padding: '2px 10px',
    margin: '0 4px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#4527a0',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d1c4e9',
    textAlign: 'center',
  }

  const btnGroupStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  }

  const primaryBtnStyle: Record<string, string | number | undefined> = {
    padding: '8px 20px',
    fontSize: '14px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }

  const secondaryBtnStyle: Record<string, string | number | undefined> = {
    padding: '8px 20px',
    fontSize: '14px',
    backgroundColor: '#fff',
    color: '#5e35b1',
    border: '1px solid #b39ddb',
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
          方案三：SWR 数据缓存（Stale-While-Revalidate）
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          全局缓存 + in-flight 去重，3 个组件共享同一 key 只发 1 次请求；后台静默刷新
        </p>
      </div>

      <div style={counterBoxStyle}>
        <div style={counterTextStyle}>
          真实网络请求次数：
          <span style={countBadgeStyle}>{requestCount}</span>
          次（未优化时为 3 次）
        </div>
        <div style={btnGroupStyle}>
          <button style={secondaryBtnStyle} onClick={handleRevalidate}>
            后台刷新（revalidate）
          </button>
          <button style={primaryBtnStyle} onClick={handleReload}>
            重新加载
          </button>
        </div>
      </div>

      <div style={descStyle}>
        <strong>原理：</strong>用模块级全局 <code>cache</code> 按 key 缓存数据 + in-flight Promise。
        相同 key 的并发调用复用同一个 Promise（首屏只 1 次请求）；有缓存时先返回旧数据（stale），
        同时后台发起新请求（revalidate），完成后静默更新。点击“后台刷新”可观察卡片右上角
        “验证中 → 已缓存”的切换，且数据不会闪空。
      </div>

      <div style={gridStyle} key={reloadKey}>
        <UserProfile />
        <UserStats />
        <UserActivity />
      </div>
    </div>
  )
}
