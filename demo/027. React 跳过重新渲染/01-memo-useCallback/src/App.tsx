import { useState, useRef, useCallback, useMemo, memo } from 'react'
import type { FC, CSSProperties, ChangeEvent } from 'react'

const styles: Record<string, CSSProperties> = {
  container: { fontFamily: 'system-ui', padding: 20, maxWidth: 900 },
  goodBox: {
    border: '1px solid #22c55e',
    borderRadius: 8,
    padding: 12,
    margin: '8px 0',
    background: '#f0fdf4',
  },
  badBox: {
    border: '1px solid #ef4444',
    borderRadius: 8,
    padding: 12,
    margin: '8px 0',
    background: '#fef2f2',
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

type ChildProps = { value: string; onClick: () => void; config: { color: string } }

// ====== Bad: 虽然包了 memo，但父组件每次渲染都传入新的函数/对象引用，memo 失效 ======
const BadChild: FC<ChildProps> = ({ value, onClick, config }) => {
  const renderCount = useRef(0)
  renderCount.current++
  return (
    <div style={styles.badBox}>
      <div style={{ fontWeight: 600 }}>BadChild (memo 但 props 每次都是新引用)</div>
      <div style={styles.counter}>渲染次数: {renderCount.current}</div>
      <div>value: {value}</div>
      <div>config.color: {config.color}</div>
      <button style={styles.button} onClick={onClick}>
        触发 onClick
      </button>
    </div>
  )
}
const MemoBadChild = memo(BadChild)

// ====== Good: useCallback 稳定函数引用，useMemo 稳定对象引用，memo 生效 ======
const GoodChild = memo<ChildProps>(({ value, onClick, config }) => {
  const renderCount = useRef(0)
  renderCount.current++
  return (
    <div style={styles.goodBox}>
      <div style={{ fontWeight: 600 }}>GoodChild (memo + useCallback + useMemo)</div>
      <div style={styles.counter}>渲染次数: {renderCount.current}</div>
      <div>value: {value}</div>
      <div>config.color: {config.color}</div>
      <button style={styles.button} onClick={onClick}>
        触发 onClick
      </button>
    </div>
  )
})

const App: FC = () => {
  const [counter, setCounter] = useState(0)
  const [text, setText] = useState('hello')

  // 不稳定：每次渲染都产生新引用 -> 破坏子组件 memo
  const badOnClick = () => {
    console.log('bad clicked, counter =', counter)
  }
  const badConfig = { color: 'red' }

  // 稳定：依赖不变则引用不变 -> 子组件 memo 可跳过渲染
  const goodOnClick = useCallback(() => {
    console.log('good clicked, counter =', counter)
  }, [counter])
  const goodConfig = useMemo(() => ({ color: 'green' }), [])

  return (
    <div style={styles.container}>
      <h2>01 - React.memo + useCallback + useMemo</h2>
      <p style={styles.counter}>
        父组件 counter: {counter} ｜ text: {text}
      </p>
      <div>
        <button style={styles.button} onClick={() => setCounter((c) => c + 1)}>
          +1 counter (只改 counter)
        </button>
        <input
          style={styles.input}
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          placeholder="改 text (两个子组件都应更新)"
        />
      </div>

      <h3>对比（观察渲染次数）</h3>
      <MemoBadChild value={text} onClick={badOnClick} config={badConfig} />
      <GoodChild value={text} onClick={goodOnClick} config={goodConfig} />

      <div style={styles.tip}>
        <b>结论：</b>点击 +1 counter 时，BadChild 因 onClick/config 每次都是新引用而重新渲染；
        GoodChild 因引用稳定被 memo 跳过。修改 text 时两者都会更新（value 变了）。
      </div>
    </div>
  )
}

export default App
