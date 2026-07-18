import { useState, useRef, useMemo } from 'react'
import type { FC, CSSProperties, ChangeEvent } from 'react'

const styles: Record<string, CSSProperties> = {
  container: { fontFamily: 'system-ui', padding: 20, maxWidth: 900 },
  counter: { fontSize: 14, color: '#666' },
  button: {
    padding: '6px 12px',
    margin: '4px',
    cursor: 'pointer',
    border: '1px solid #333',
    borderRadius: 4,
    background: '#fff',
  },
  buttonOn: {
    padding: '6px 12px',
    margin: '4px',
    cursor: 'pointer',
    border: '1px solid #22c55e',
    borderRadius: 4,
    background: '#f0fdf4',
  },
  buttonOff: {
    padding: '6px 12px',
    margin: '4px',
    cursor: 'pointer',
    border: '1px solid #ef4444',
    borderRadius: 4,
    background: '#fef2f2',
  },
  list: { maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 4, padding: 4 },
  row: { padding: '2px 4px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  tip: {
    marginTop: 16,
    padding: 12,
    background: '#fffbeb',
    border: '1px solid #fbbf24',
    borderRadius: 8,
  },
}

type Item = { id: number; value: number; label: string }

// 生成大数据集
function createData(n: number): Item[] {
  const arr: Item[] = []
  for (let i = 0; i < n; i++) {
    arr.push({ id: i, value: Math.random() * 1000, label: `item-${i}` })
  }
  return arr
}
const DATA = createData(4000)

// 昂贵计算：过滤 + 多轮变换 + 排序
function expensiveCompute(threshold: number): { result: Item[]; time: number } {
  const start = performance.now()
  let result = DATA.filter((x) => x.value > threshold)
  for (let k = 0; k < 3; k++) {
    result = result.map((x) => ({
      id: x.id,
      value: Math.sqrt(x.value) * Math.sin(x.value) + 500,
      label: x.label,
    }))
  }
  result.sort((a, b) => a.value - b.value)
  return { result, time: performance.now() - start }
}

const List: FC<{ items: Item[] }> = ({ items }) => {
  const renderCount = useRef(0)
  renderCount.current++
  return (
    <div>
      <div style={styles.counter}>List 渲染次数: {renderCount.current}</div>
      <div style={styles.list}>
        {items.slice(0, 50).map((it) => (
          <div key={it.id} style={styles.row}>
            {it.label} : {it.value.toFixed(2)}
          </div>
        ))}
      </div>
      <div style={styles.counter}>...共 {items.length} 条（仅显示前 50）</div>
    </div>
  )
}

const App: FC = () => {
  const [threshold, setThreshold] = useState(500)
  const [useMemoEnabled, setUseMemoEnabled] = useState(true)
  const [unrelated, setUnrelated] = useState(0) // 不相关状态，触发 App 重新渲染

  // 始终无条件调用 useMemo（遵守 Rules of Hooks）
  const memoized = useMemo(() => expensiveCompute(threshold), [threshold])
  // 关闭时每次都重算；开启时复用缓存
  const compute = useMemoEnabled ? memoized : expensiveCompute(threshold)

  return (
    <div style={styles.container}>
      <h2>02 - useMemo 用于昂贵计算</h2>
      <p style={styles.counter}>不相关状态 unrelated: {unrelated}（改它会让 App 重新渲染）</p>

      <div>
        <button style={styles.button} onClick={() => setUnrelated((n) => n + 1)}>
          改 unrelated 状态
        </button>
        <button
          style={useMemoEnabled ? styles.buttonOn : styles.buttonOff}
          onClick={() => setUseMemoEnabled((v) => !v)}
        >
          useMemo: {useMemoEnabled ? '开启' : '关闭'}
        </button>
      </div>

      <div style={{ margin: '8px 0' }}>
        <label style={styles.counter}>threshold: {threshold}</label>
        <input
          type="range"
          min={0}
          max={1000}
          value={threshold}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setThreshold(Number(e.target.value))}
        />
      </div>

      <div style={styles.counter}>本次计算耗时: {compute.time.toFixed(2)} ms</div>
      <List items={compute.result} />

      <div style={styles.tip}>
        <b>结论：</b>关闭 useMemo 时，每次点"改 unrelated 状态"都会重跑昂贵计算（耗时明显）； 开启
        useMemo 后，仅 threshold 变化才重算，否则复用缓存（耗时接近上一次的值，不会重复消耗）。
      </div>
    </div>
  )
}

export default App
