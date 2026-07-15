import { useState, useMemo } from 'react'
import { generateBigTree, countNodes } from './utils/treeData'
import type { TreeNode } from './utils/treeData'
import NormalTree from './components/NormalTree'
import VirtualTree from './components/VirtualTree'
import TimeSliceTree from './components/TimeSliceTree'

type Method = 'normal' | 'virtual' | 'timeSlice'

const TABS: { key: Method; label: string; desc: string }[] = [
  { key: 'normal', label: '方法一: 直接渲染', desc: '递归全量渲染，性能最差（对比用）' },
  { key: 'virtual', label: '方法二: 虚拟列表', desc: '只渲染可视区域，DOM 数恒定（推荐）' },
  { key: 'timeSlice', label: '方法三: 时间分片', desc: 'useTransition 低优先级更新' },
]

export default function App() {
  const [depth, setDepth] = useState(5)
  const [breadth, setBreadth] = useState(8)
  const [data, setData] = useState<TreeNode[]>([])
  const [method, setMethod] = useState<Method>('virtual')
  const [loading, setLoading] = useState(false)

  const totalNodes = useMemo(() => countNodes(data), [data])

  const handleGenerate = () => {
    setLoading(true)
    // 用 setTimeout 让 UI 先更新 loading 态，避免主线程被阻塞时白屏
    setTimeout(() => {
      const tree = generateBigTree(depth, breadth)
      setData(tree)
      setLoading(false)
    }, 50)
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>React + TS + Vite — 超大树形数据处理</h2>

      {/* 数据生成控制面板 */}
      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>模拟后端一次性返回的超大树形数据</h3>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            树深度:
            <input
              type="number"
              min={1}
              max={8}
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              style={{ width: '60px', marginLeft: '8px' }}
            />
          </label>
          <label>
            每层子节点数:
            <input
              type="number"
              min={1}
              max={20}
              value={breadth}
              onChange={(e) => setBreadth(Number(e.target.value))}
              style={{ width: '60px', marginLeft: '8px' }}
            />
          </label>
          <button
            onClick={handleGenerate}
            style={{
              padding: '6px 16px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {loading ? '生成中...' : '生成数据'}
          </button>
          {data.length > 0 && (
            <span style={{ color: '#e65100' }}>
              总节点数: <strong>{totalNodes}</strong>
            </span>
          )}
        </div>
        <p style={{ color: '#999', fontSize: '13px', marginBottom: 0 }}>
          提示: 深度5×广度8 ≈ 37448 节点 | 深度5×广度10 ≈ 111110 节点
        </p>
      </div>

      {/* 方法切换 Tab */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMethod(tab.key)}
            style={{
              padding: '8px 16px',
              background: method === tab.key ? '#1976d2' : '#fff',
              color: method === tab.key ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 当前方法说明 */}
      <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
        {TABS.find((t) => t.key === method)?.desc}
      </div>

      {/* 树渲染区域 */}
      {data.length > 0 ? (
        method === 'normal' ? (
          <NormalTree data={data} />
        ) : method === 'virtual' ? (
          <VirtualTree data={data} defaultExpandDepth={0} />
        ) : (
          <TimeSliceTree data={data} defaultExpandDepth={0} />
        )
      ) : (
        <div
          style={{
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ddd',
            borderRadius: '4px',
            color: '#999',
          }}
        >
          请先生成数据
        </div>
      )}
    </div>
  )
}
