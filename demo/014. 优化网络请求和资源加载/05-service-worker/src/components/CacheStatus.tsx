import { useState, useEffect, useCallback } from 'react'
import {
  registerServiceWorker,
  unregisterServiceWorker,
  getSWStatus,
  PRECACHE_URLS,
  type SWRegistrationResult,
  type SWStatus,
} from '../utils/sw-register'
import {
  STRATEGIES,
  cacheFirst,
  networkFirst,
  staleWhileRevalidate,
  clearMockCache,
  type CacheEntry,
  type CacheStrategy,
} from '../utils/cache-strategy'

/**
 * 缓存状态组件
 *
 * 展示 Service Worker 的：
 * 1. 注册状态
 * 2. 预缓存资源列表
 * 3. 缓存策略演示 - 点击按钮模拟不同策略的请求
 * 4. 请求日志 - 展示缓存命中情况
 */
export default function CacheStatus() {
  const [swResult, setSwResult] = useState<SWRegistrationResult | null>(null)
  const [swStatus, setSwStatus] = useState<SWStatus | null>(null)
  const [logs, setLogs] = useState<CacheEntry[]>([])
  const [loading, setLoading] = useState(false)

  const handleRegister = useCallback(async () => {
    setLoading(true)
    const result = await registerServiceWorker()
    setSwResult(result)
    if (result.success) {
      const status = await getSWStatus()
      setSwStatus(status)
    }
    setLoading(false)
  }, [])

  const handleUnregister = useCallback(async () => {
    setLoading(true)
    const result = await unregisterServiceWorker()
    setSwResult(result)
    setSwStatus(null)
    clearMockCache()
    setLogs([])
    setLoading(false)
  }, [])

  const handleTestStrategy = useCallback(async (strategy: CacheStrategy) => {
    const url = `/api/data?strategy=${strategy}&t=${Date.now()}`
    let entry: CacheEntry
    // 第二次请求同策略的 URL（模拟缓存命中）
    const cacheUrl = `/api/data?strategy=${strategy}`

    if (strategy === 'cache-first') {
      await cacheFirst(cacheUrl) // 第一次请求（网络）
      entry = await cacheFirst(cacheUrl) // 第二次请求（缓存）
    } else if (strategy === 'network-first') {
      await networkFirst(cacheUrl)
      entry = await networkFirst(cacheUrl)
    } else {
      await staleWhileRevalidate(cacheUrl)
      entry = await staleWhileRevalidate(cacheUrl)
    }

    setLogs((prev) => [...prev.slice(-8), entry])
  }, [])

  useEffect(() => {
    // 自动注册
    handleRegister()
  }, [handleRegister])

  const containerStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  const cardStyle: Record<string, string | number | undefined> = {
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e0e0',
  }

  const statusRowStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  }

  const dotStyle = (active: boolean): Record<string, string | number | undefined> => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: active ? '#4caf50' : '#ccc',
    display: 'inline-block',
  })

  const buttonStyle: Record<string, string | number | undefined> = {
    padding: '8px 20px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#fff',
  }

  const strategyGridStyle: Record<string, string | number | undefined> = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  }

  const strategyCardStyle = (color: string): Record<string, string | number | undefined> => ({
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${color}44`,
    backgroundColor: `${color}08`,
  })

  return (
    <div style={containerStyle}>
      {/* SW 注册状态 */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
          Service Worker 状态
        </h3>
        <div style={statusRowStyle}>
          <span style={dotStyle(swStatus?.active ?? false)} />
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {swStatus?.active ? '已激活' : '未注册'}
          </span>
          {swStatus?.scope && (
            <span style={{ fontSize: '13px', color: '#999' }}>Scope: {swStatus.scope}</span>
          )}
        </div>
        {swResult?.message && (
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>{swResult.message}</p>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{ ...buttonStyle, backgroundColor: '#4caf50' }}
            onClick={handleRegister}
            disabled={loading}
          >
            注册 SW
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: '#f44336' }}
            onClick={handleUnregister}
            disabled={loading}
          >
            取消注册
          </button>
        </div>
      </div>

      {/* 预缓存资源 */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>预缓存资源列表</h3>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#999' }}>
          Service Worker 安装时会预缓存以下资源，实现离线访问：
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PRECACHE_URLS.map((url) => (
            <span
              key={url}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '4px',
              }}
            >
              {url}
            </span>
          ))}
        </div>
      </div>

      {/* 缓存策略演示 */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>缓存策略演示</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#999' }}>
          点击策略按钮模拟请求（每个策略会连续请求两次，第二次展示缓存效果）：
        </p>
        <div style={strategyGridStyle}>
          {(Object.keys(STRATEGIES) as CacheStrategy[]).map((key) => {
            const s = STRATEGIES[key]
            return (
              <div key={key} style={strategyCardStyle(s.color)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: s.color }}>
                      {s.nameCn}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                      {s.name}
                    </span>
                  </div>
                  <button
                    style={{
                      ...buttonStyle,
                      backgroundColor: s.color,
                      padding: '6px 16px',
                      fontSize: '13px',
                    }}
                    onClick={() => handleTestStrategy(key)}
                  >
                    测试
                  </button>
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#666' }}>
                  {s.description}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                  适用: {s.bestFor}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 请求日志 */}
      {logs.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>请求日志</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {logs.map((log, i) => {
              const s = STRATEGIES[log.strategy]
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: '#ccc', fontFamily: 'monospace' }}>{log.timestamp}</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: s.color,
                    }}
                  >
                    {s.nameCn}
                  </span>
                  <span style={{ color: log.fromCache ? '#4caf50' : '#ff9800', fontWeight: 'bold' }}>
                    {log.fromCache ? '缓存命中' : '网络请求'}
                  </span>
                  <span style={{ color: '#999' }}>{log.duration.toFixed(0)}ms</span>
                  <span style={{ color: '#bbb' }}>{log.size}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
