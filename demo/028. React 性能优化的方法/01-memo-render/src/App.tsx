import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ChangeEvent, FC } from 'react'

/** 统计组件渲染次数 */
function useRenderCount(): number {
  const ref = useRef(0)
  ref.current += 1
  return ref.current
}

// ---------------- 子组件 ----------------

interface ChildProps {
  label: string
  value?: number
  onClick?: () => void
}

/** 未做任何优化的子组件：父组件任意 state 变化都会触发它的渲染 */
const UnoptimizedChild: FC<ChildProps> = ({ label, value }) => {
  const count = useRenderCount()
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">value = {value ?? '-'}</div>
      <div>
        渲染次数: <span className="counter">{count}</span>{' '}
        <span className="badge bad">每次都渲染</span>
      </div>
    </div>
  )
}

/** 使用 React.memo 包裹：仅当 props 浅比较变化时才重渲染 */
const MemoChild = memo<ChildProps>(({ label, value }) => {
  const count = useRenderCount()
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">value = {value ?? '-'}</div>
      <div>
        渲染次数: <span className="counter">{count}</span>{' '}
        <span className="badge">props 不变不渲染</span>
      </div>
    </div>
  )
})

/** 接收回调的子组件（未被 memo 包裹） */
const CallbackChild: FC<ChildProps> = ({ label, onClick }) => {
  const count = useRenderCount()
  useEffect(() => {
    if (onClick) onClick()
  }, [onClick])
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div>
        渲染次数: <span className="counter">{count}</span>
      </div>
    </div>
  )
}

/** 被 memo 包裹 + 接收 useCallback 稳定回调 */
const MemoCallbackChild = memo<ChildProps>(({ label, onClick }) => {
  const count = useRenderCount()
  useEffect(() => {
    if (onClick) onClick()
  }, [onClick])
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div>
        渲染次数: <span className="counter">{count}</span>{' '}
        <span className="badge">useCallback 稳定</span>
      </div>
    </div>
  )
})

/** 接收数组类型 props 的子组件 */
const ExpensiveChild = memo<{ label: string; list: number[] }>(({ label, list }) => {
  const count = useRenderCount()
  const sum = list.reduce((a, b) => a + b, 0)
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">sum = {sum}</div>
      <div>
        渲染次数: <span className="counter">{count}</span>
      </div>
    </div>
  )
})

// ---------------- 父组件 ----------------

const App: FC = () => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const parentRenderCount = useRenderCount()

  // 不稳定：每次父组件渲染都生成新的函数引用
  const unstableCallback = () => {
    void count
  }

  // 稳定：useCallback 仅在 count 变化时才生成新引用
  const stableCallback = useCallback(() => {
    void count
  }, [count])

  // 不稳定：每次都新建数组
  const unstableList = [1, 2, 3, count]

  // 稳定：useMemo 缓存计算结果，引用保持不变
  const stableList = useMemo(() => [1, 2, 3, count], [count])

  const themeStyle: CSSProperties =
    theme === 'dark'
      ? { background: '#1f2933', color: '#f8fafc', padding: '8px 12px', borderRadius: 6 }
      : { background: '#f8fafc', color: '#1f2933', padding: '8px 12px', borderRadius: 6 }

  return (
    <div className="app">
      <h1>React.memo / useMemo / useCallback 渲染优化</h1>
      <p className="subtitle">
        父组件总渲染次数: <span className="counter">{parentRenderCount}</span>。点击下方按钮改变不同
        state，观察子组件的渲染次数差异。
      </p>

      <section className="section">
        <h2>1. 父组件控制台</h2>
        <div className="row" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={() => setCount((c) => c + 1)}>
            count + 1 (当前 {count})
          </button>
          <input
            className="input"
            value={text}
            placeholder="输入文本（仅改 text state）"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          />
          <button
            className="btn ghost"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            切换 theme: {theme}
          </button>
        </div>
        <div className="row">
          <div style={themeStyle}>当前 theme = {theme}</div>
          <div className="note">
            改 text 或 theme 应当只触发未优化组件重渲染，memo 组件保持不渲染。
          </div>
        </div>
      </section>

      <section className="section">
        <h2>2. memo 是否包裹对比</h2>
        <div className="grid-2">
          <UnoptimizedChild label="未优化子组件" value={count} />
          <MemoChild label="React.memo 子组件" value={count} />
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          两个子组件接收相同 props (value=count)。修改 text 时，未优化组件会重渲染，而 memo 组件因
          props 浅比较未变化而跳过渲染。
        </div>
      </section>

      <section className="section">
        <h2>3. useCallback 对比</h2>
        <div className="grid-2">
          <CallbackChild label="接收不稳定回调" onClick={unstableCallback} />
          <MemoCallbackChild label="接收 useCallback 稳定回调" onClick={stableCallback} />
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          即使子组件被 memo 包裹，如果传入的回调每次都是新引用，memo 也会失效。useCallback
          可让回调引用保持稳定。
        </div>
      </section>

      <section className="section">
        <h2>4. useMemo 对比</h2>
        <div className="grid-2">
          <ExpensiveChild label="接收不稳定数组" list={unstableList} />
          <ExpensiveChild label="接收 useMemo 数组" list={stableList} />
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          对象 / 数组类型的 props 每次新建都会破坏 memo 浅比较。useMemo 缓存引用，避免无谓重渲染。
        </div>
      </section>

      <section className="section">
        <h2>5. 三种 API 对比表</h2>
        <table className="cmp">
          <thead>
            <tr>
              <th>API</th>
              <th>作用对象</th>
              <th>触发条件</th>
              <th>典型场景</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>React.memo</td>
              <td>组件</td>
              <td>props 浅比较变化</td>
              <td>纯展示型子组件、列表项</td>
            </tr>
            <tr>
              <td>useMemo</td>
              <td>值（对象 / 数组 / 计算结果）</td>
              <td>deps 变化</td>
              <td>昂贵计算、保持引用稳定传给 memo 子组件</td>
            </tr>
            <tr>
              <td>useCallback</td>
              <td>函数</td>
              <td>deps 变化</td>
              <td>事件回调作为 props 传给 memo 子组件</td>
            </tr>
          </tbody>
        </table>
        <div className="note" style={{ marginTop: 12 }}>
          注意：memo 必须配合稳定的 props 才能生效；滥用 useMemo / useCallback 也会带来 deps
          比较开销，建议只在确有性能瓶颈时使用。
        </div>
      </section>
    </div>
  )
}

export default App
