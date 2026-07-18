import { useState, useRef, useEffect } from 'react'
import type { FC, CSSProperties, ChangeEvent } from 'react'

const styles: Record<string, CSSProperties> = {
  container: { fontFamily: 'system-ui', padding: 20, maxWidth: 1000 },
  row: { display: 'flex', gap: 16 },
  panel: { flex: 1, border: '1px solid #ccc', borderRadius: 8, padding: 12, margin: '8px 0' },
  box: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: 8,
    margin: '6px 0',
    background: '#f9fafb',
  },
  button: {
    padding: '6px 12px',
    margin: '4px',
    cursor: 'pointer',
    border: '1px solid #333',
    borderRadius: 4,
    background: '#fff',
  },
  input: { padding: '6px', margin: '4px', border: '1px solid #333', borderRadius: 4 },
  counter: { fontSize: 14, color: '#666' },
  tip: {
    marginTop: 16,
    padding: 12,
    background: '#fffbeb',
    border: '1px solid #fbbf24',
    borderRadius: 8,
  },
}

// 渲染计数器（自定义 hook）
function useRenderCount(): number {
  const ref = useRef(0)
  ref.current++
  return ref.current
}

// ====== Panel A：所有状态都在父组件 ======
const SiblingA: FC = () => {
  const c = useRenderCount()
  return <div style={styles.box}>SiblingA（不用 text）渲染次数: {c}</div>
}
const ChildA: FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const c = useRenderCount()
  return (
    <div style={styles.box}>
      <div>ChildA 渲染次数: {c}</div>
      <input
        style={styles.input}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder="输入会更新父状态"
      />
    </div>
  )
}
const PanelA: FC = () => {
  const [text, setText] = useState('')
  return (
    <div style={styles.panel}>
      <h3>Panel A：状态在父组件</h3>
      <ChildA value={text} onChange={setText} />
      <SiblingA />
    </div>
  )
}

// ====== Panel B：状态就近放在子组件 ======
const SiblingB: FC = () => {
  const c = useRenderCount()
  return <div style={styles.box}>SiblingB（不用 text）渲染次数: {c}</div>
}
const ChildB: FC = () => {
  const [text, setText] = useState('')
  const c = useRenderCount()
  return (
    <div style={styles.box}>
      <div>ChildB 渲染次数: {c}</div>
      <input
        style={styles.input}
        value={text}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        placeholder="输入只更新自己"
      />
    </div>
  )
}
const PanelB: FC = () => {
  return (
    <div style={styles.panel}>
      <h3>Panel B：状态就近（colocation）</h3>
      <ChildB />
      <SiblingB />
    </div>
  )
}

// ====== useEffect 依赖数组演示 ======
const EffectDemo: FC = () => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const effectFireCount = useRef(0)
  useEffect(() => {
    effectFireCount.current++
  }, [count])
  return (
    <div style={styles.panel}>
      <h3>useEffect 依赖数组演示</h3>
      <div style={styles.counter}>
        count: {count} ｜ text: {text}
      </div>
      <div style={styles.counter}>useEffect([count]) 触发次数: {effectFireCount.current}</div>
      <div>
        <button style={styles.button} onClick={() => setCount((c) => c + 1)}>
          +1 count（触发 effect）
        </button>
        <input
          style={styles.input}
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          placeholder="改 text 不应触发 effect"
        />
      </div>
    </div>
  )
}

const App: FC = () => {
  return (
    <div style={styles.container}>
      <h2>03 - 状态就近 & 依赖数组</h2>
      <p style={styles.counter}>在两个 Panel 的输入框里打字，观察兄弟组件的渲染次数差异。</p>
      <div style={styles.row}>
        <PanelA />
        <PanelB />
      </div>
      <EffectDemo />
      <div style={styles.tip}>
        <b>结论：</b>把状态放到真正使用它的组件里（就近原则 / state
        colocation），可避免兄弟组件无意义重渲染； useEffect 的依赖数组决定 effect
        何时重新执行，只列出真正依赖的值，避免多余执行。
      </div>
    </div>
  )
}

export default App
