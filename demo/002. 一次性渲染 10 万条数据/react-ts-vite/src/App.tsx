import { useState, useMemo } from 'react'
import NormalList from './components/NormalList'
import VirtualList from './components/VirtualList'
import TimeSliceList from './components/TimeSliceList'
import { generateData } from './utils/data'

type Method = 'normal' | 'virtual' | 'timeslice'

const TOTAL = 100000

const methods: { key: Method; label: string; desc: string }[] = [
  { key: 'normal', label: '方法一：直接渲染', desc: '一次性渲染全部 DOM（会卡顿，仅作对比）' },
  { key: 'virtual', label: '方法二：虚拟列表', desc: '只渲染可视区域，DOM 数量恒定（推荐）' },
  { key: 'timeslice', label: '方法三：时间分片', desc: 'requestAnimationFrame 分批渲染' },
]

export default function App() {
  const [method, setMethod] = useState<Method>('virtual')
  const [tick, setTick] = useState(0)

  // 数据只生成一次，切换方法时复用同一份数据
  const data = useMemo(() => generateData(TOTAL), [])

  const handleReload = () => setTick((t) => t + 1)

  const current = methods.find((m) => m.key === method)!

  return (
    <div className="app">
      <h1>页面内一次性渲染 {TOTAL.toLocaleString()} 条数据</h1>

      <div className="tabs">
        {methods.map((m) => (
          <button
            key={m.key}
            className={`tab-btn ${method === m.key ? 'active' : ''}`}
            onClick={() => setMethod(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <button onClick={handleReload}>重新渲染</button>
        <span className="status">{current.desc}</span>
      </div>

      <div className="status" style={{ marginBottom: 8 }}>
        总数据量：{data.length.toLocaleString()} 条 · 当前方法：{current.label}
      </div>

      {/* key 变化可强制重新挂载组件 */}
      <div key={`${method}-${tick}`}>
        {method === 'normal' && <NormalList data={data} />}
        {method === 'virtual' && <VirtualList data={data} />}
        {method === 'timeslice' && <TimeSliceList data={data} />}
      </div>
    </div>
  )
}
