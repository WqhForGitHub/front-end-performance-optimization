import { useState } from 'react'
import type { FetchResult } from './utils/api'
import {
  fetchUsersSequential,
  fetchUsersBatch,
  fetchUsersConcurrent,
} from './utils/api'
import DataGrid from './components/DataGrid'

const REQUEST_COUNT = 8
const USER_IDS = Array.from({ length: REQUEST_COUNT }, (_, i) => i + 1)

/**
 * 请求合并与并发限制演示
 *
 * 对比三种请求策略：
 * 1. 顺序请求 - 一个接一个，总时间 = 所有请求时间之和
 * 2. 批量请求 - Promise.all 同时发起，最快但可能超出并发限制
 * 3. 并发限制 - 限制最大并发数，兼顾速度和稳定性
 */
export default function App() {
  const [result, setResult] = useState<FetchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [concurrency, setConcurrency] = useState(3)

  const handleLoad = async (mode: 'sequential' | 'batch' | 'concurrent') => {
    setLoading(true)
    setResult(null)
    try {
      let res: FetchResult
      if (mode === 'sequential') {
        res = await fetchUsersSequential(USER_IDS)
      } else if (mode === 'batch') {
        res = await fetchUsersBatch(USER_IDS)
      } else {
        res = await fetchUsersConcurrent(USER_IDS, concurrency)
      }
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const pageStyle: Record<string, string | number | undefined> = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const descStyle: Record<string, string | number | undefined> = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const buttonRowStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  }

  const btnBase: Record<string, string | number | undefined> = {
    padding: '10px 24px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#fff',
    transition: 'opacity 0.2s',
  }

  const controlStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#666',
  }

  const selectStyle: Record<string, string | number | undefined> = {
    padding: '8px 12px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>请求合并与并发限制</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          对比顺序、批量、并发限制三种请求策略的性能差异
        </p>
      </div>

      <div style={descStyle}>
        下方按钮将请求 <strong>{REQUEST_COUNT}</strong> 个用户数据，对比不同策略的耗时：
        <br />
        - <strong style={{ color: '#f44336' }}>顺序请求</strong>：一个接一个，总时间 = 所有请求时间之和
        <br />
        - <strong style={{ color: '#4caf50' }}>批量请求 (Promise.all)</strong>：同时发起所有请求，最快但可能超出浏览器并发限制
        <br />
        - <strong style={{ color: '#ff9800' }}>并发限制</strong>：限制最大并发数，兼顾速度和服务器压力
      </div>

      <div style={buttonRowStyle}>
        <button
          style={{ ...btnBase, backgroundColor: '#f44336' }}
          onClick={() => handleLoad('sequential')}
          disabled={loading}
        >
          顺序请求
        </button>
        <button
          style={{ ...btnBase, backgroundColor: '#4caf50' }}
          onClick={() => handleLoad('batch')}
          disabled={loading}
        >
          批量请求 (Promise.all)
        </button>
        <button
          style={{ ...btnBase, backgroundColor: '#ff9800' }}
          onClick={() => handleLoad('concurrent')}
          disabled={loading}
        >
          并发限制请求
        </button>
        <div style={controlStyle}>
          <label>最大并发:</label>
          <select
            style={selectStyle}
            value={concurrency}
            onChange={(e: { target: { value: string } }) => setConcurrency(Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>

      <DataGrid result={result} loading={loading} />
    </div>
  )
}
