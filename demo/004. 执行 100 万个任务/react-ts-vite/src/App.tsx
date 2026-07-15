import { useState } from 'react'
import DirectTask from './components/DirectTask'
import SetTimeoutTask from './components/SetTimeoutTask'
import IdleCallbackTask from './components/IdleCallbackTask'
import WorkerTask from './components/WorkerTask'

type Method = 'direct' | 'setTimeout' | 'idleCallback' | 'worker'

const TABS: { key: Method; label: string; desc: string }[] = [
  { key: 'direct', label: '方法一: 直接执行', desc: '同步循环，主线程完全阻塞（对比用）' },
  { key: 'setTimeout', label: '方法二: setTimeout 分片', desc: '分批执行 + setTimeout 让出主线程' },
  { key: 'idleCallback', label: '方法三: requestIdleCallback', desc: '利用浏览器空闲时间执行' },
  { key: 'worker', label: '方法四: Web Worker', desc: '独立线程执行，主线程零阻塞（推荐）' },
]

export default function App() {
  const [method, setMethod] = useState<Method>('worker')

  const current = TABS.find((t) => t.key === method)!

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>React + TS + Vite - 执行 100 万个任务</h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        演示在浏览器中执行 100 万个计算任务时，不同方案对页面流畅度的影响。
      </p>

      {/* 方法切换 Tab */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMethod(tab.key)}
            style={{
              padding: '8px 16px',
              background: method === tab.key ? '#1677ff' : '#fff',
              color: method === tab.key ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 当前方法说明 */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px 16px',
          background: '#f5f5f5',
          borderRadius: '6px',
          color: '#666',
          fontSize: '14px',
        }}
      >
        {current.desc}
      </div>

      {/* 任务执行区域 */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        {method === 'direct' && <DirectTask />}
        {method === 'setTimeout' && <SetTimeoutTask />}
        {method === 'idleCallback' && <IdleCallbackTask />}
        {method === 'worker' && <WorkerTask />}
      </div>
    </div>
  )
}
