import type { FC, ReactNode } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ============================================================================
// 工具函数
// ============================================================================

/** 简易 debounce：延迟触发，避免高频输入反复 re-render */
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

// ============================================================================
// 渲染计数器：通过 ref + 计数展示子组件被渲染了多少次
// ============================================================================

const useRenderCount = (name: string): number => {
  const countRef = useRef(0)
  countRef.current += 1
  // 仅做演示用，控制台可观察
  if (typeof window !== 'undefined') {
    ;(window as any).__renderCounts = (window as any).__renderCounts || {}
    ;(window as any).__renderCounts[name] = countRef.current
  }
  return countRef.current
}

// ============================================================================
// 1) React.memo + useCallback 演示
// 未包裹 memo 的子组件每次父组件更新都会重渲染
// 包裹 memo + 传入稳定 callback 的子组件则不会
// ============================================================================

interface ChildProps {
  label: string
  onClick: () => void
}

/** 未优化的子组件：父组件任意更新都会触发它重渲染 */
const BadChild: FC<ChildProps> = ({ label, onClick }) => {
  const count = useRenderCount('BadChild')
  return (
    <div
      className="compare-col"
      style={{ padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}
    >
      <div style={{ fontSize: 13, color: '#991b1b', marginBottom: 4 }}>未优化 BadChild</div>
      <button className="btn" style={{ background: '#ef4444', marginBottom: 4 }} onClick={onClick}>
        {label}
      </button>
      <div className="counter">
        渲染次数: <b>{count}</b>
      </div>
    </div>
  )
}

/** memo 包裹 + 父组件用 useCallback 传稳定函数：props 不变就不重渲染 */
const GoodChild: FC<ChildProps> = memo(({ label, onClick }) => {
  const count = useRenderCount('GoodChild')
  return (
    <div
      className="compare-col"
      style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}
    >
      <div style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>优化 GoodChild (memo)</div>
      <button className="btn" style={{ background: '#22c55e', marginBottom: 4 }} onClick={onClick}>
        {label}
      </button>
      <div className="counter">
        渲染次数: <b>{count}</b>
      </div>
    </div>
  )
})

// ============================================================================
// 2) 虚拟滚动：长列表只渲染可视区域内的元素
// 10000 条数据 -> 仅渲染约 10 条 DOM 节点
// ============================================================================

interface VirtualListProps {
  itemCount: number
  itemHeight: number
  windowHeight: number
}

const VirtualList: FC<VirtualListProps> = ({ itemCount, itemHeight, windowHeight }) => {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = itemCount * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2)
  const endIndex = Math.min(itemCount, Math.ceil((scrollTop + windowHeight) / itemHeight) + 2)
  const visibleItems = useMemo(() => {
    const items: { index: number; key: string }[] = []
    for (let i = startIndex; i < endIndex; i++) {
      items.push({ index: i, key: 'item-' + i })
    }
    return items
  }, [startIndex, endIndex])

  const handleScroll = useCallback((e: { currentTarget: { scrollTop: number } }) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div className="virtual-window" onScroll={handleScroll} style={{ height: windowHeight }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item) => (
            <div className="virtual-row" key={item.key} style={{ height: itemHeight }}>
              <span style={{ color: '#0284c7', fontWeight: 600, marginRight: 12 }}>
                #{item.index + 1}
              </span>
              <span>
                这是第 {item.index + 1} 行，共 {itemCount} 行数据
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 3) Debounce 搜索演示
// ============================================================================

interface SearchDemoProps {}

const SearchDemo: FC<SearchDemoProps> = () => {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [rawCount, setRawCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // 每次 keyword 变化都触发"原始"搜索请求（高频）
  useEffect(() => {
    setRawCount((c) => c + 1)
  }, [keyword])

  // 用 useMemo 持有稳定 debounce 函数（仅创建一次）
  const debouncedSearch = useMemo(
    () =>
      debounce((v: string) => {
        setDebouncedKeyword(v)
        setDebouncedCount((c) => c + 1)
      }, 400),
    [],
  )

  const handleChange = (e: { target: { value: string } }) => {
    setKeyword(e.target.value)
    debouncedSearch(e.target.value)
  }

  const results = useMemo(() => {
    if (!debouncedKeyword) return [] as string[]
    const base = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry', 'Fig', 'Grape', 'Honeydew']
    return base.filter((f) => f.toLowerCase().includes(debouncedKeyword.toLowerCase()))
  }, [debouncedKeyword])

  return (
    <div>
      <input
        className="input"
        placeholder="输入关键字搜索 (试试快速连续输入)"
        value={keyword}
        onChange={handleChange}
      />
      <div className="row" style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
        <span className="counter">
          原始触发: <b style={{ color: '#ef4444' }}>{rawCount}</b>
        </span>
        <span className="counter">
          debounce 触发: <b style={{ color: '#22c55e' }}>{debouncedCount}</b>
        </span>
        <span>
          当前 keyword: <code>{keyword || '(空)'}</code>
        </span>
        <span>
          debounced: <code>{debouncedKeyword || '(空)'}</code>
        </span>
      </div>
      {results.length > 0 ? (
        <div style={{ marginTop: 8 }}>
          {results.map((r) => (
            <div className="search-result" key={r}>
              {r}
            </div>
          ))}
        </div>
      ) : debouncedKeyword ? (
        <div className="search-result">无匹配结果</div>
      ) : null}
    </div>
  )
}

// ============================================================================
// 4) requestAnimationFrame 动画演示
// 对比 setInterval 抖动 vs rAF 平滑
// ============================================================================

const RAFDemo: FC = () => {
  const [posInterval, setPosInterval] = useState(0)
  const [posRAF, setPosRAF] = useState(0)
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    setRunning(true)
    let p1 = 0
    let p2 = 0
    // setInterval 模式：可能丢帧、抖动
    intervalRef.current = setInterval(() => {
      p1 = (p1 + 5) % 100
      setPosInterval(p1)
    }, 16)
    // rAF 模式：与浏览器刷新率同步，更流畅
    const tick = () => {
      p2 = (p2 + 0.6) % 100
      setPosRAF(p2)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const stop = () => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn" onClick={start} disabled={running}>
          开始动画
        </button>
        <button className="btn outline" onClick={stop} disabled={!running}>
          停止
        </button>
        <span className="stat">对比 setInterval(16ms) 与 requestAnimationFrame</span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>setInterval</div>
        <div
          style={{
            height: 28,
            background: '#f1f5f9',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: posInterval + '%',
              top: 0,
              bottom: 0,
              width: 28,
              background: '#ef4444',
              borderRadius: 4,
              transition: 'none',
            }}
          />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#22c55e', marginBottom: 4 }}>requestAnimationFrame</div>
        <div
          style={{
            height: 28,
            background: '#f1f5f9',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: posRAF + '%',
              top: 0,
              bottom: 0,
              width: 28,
              background: '#22c55e',
              borderRadius: 4,
              transition: 'none',
            }}
          />
        </div>
      </div>
      <div className="note">rAF 与显示器刷新率同步，避免丢帧；后台标签页时自动暂停。</div>
    </div>
  )
}

// ============================================================================
// 容器组件
// ============================================================================

const Card: FC<{ title: string; badge?: string; children: ReactNode }> = ({
  title,
  badge,
  children,
}) => (
  <section className="section">
    <h2>
      {title}
      {badge ? <span className="badge">{badge}</span> : null}
    </h2>
    {children}
  </section>
)

const memoCode = `// 1. React.memo: 包裹子组件，浅比较 props
const GoodChild = memo(({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>
})

// 2. useCallback: 父组件传稳定的回调函数
const handleClick = useCallback(() => {
  console.log('clicked')
}, []) // 依赖为空，函数引用永远稳定

// 3. useMemo: 缓存昂贵计算结果
const filtered = useMemo(
  () => heavyFilter(list, keyword),
  [list, keyword], // 仅当依赖变化时才重新计算
)`

const virtualCode = `// 虚拟滚动：只渲染可视区域
const startIndex = Math.floor(scrollTop / itemHeight)
const endIndex = startIndex + Math.ceil(windowHeight / itemHeight)

// 渲染 [startIndex, endIndex] 范围内的元素
// 1 万条数据 -> 仅 ~10 个 DOM 节点
<div style={{ height: totalHeight, position: 'relative' }}>
  {visibleItems.map(item => (
    <Row key={item.key} style={{ position: 'absolute', top: item.index * itemHeight }} />
  ))}
</div>`

const debounceCode = `// debounce: 防抖，避免高频事件触发多次
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 400ms 内连续输入只触发一次搜索
const onSearch = debounce(fetchResults, 400)`

const rafCode = `// requestAnimationFrame: 与浏览器刷新率同步
function animate() {
  pos = (pos + step) % 100
  setPos(pos)
  rafId = requestAnimationFrame(animate)
}
const rafId = requestAnimationFrame(animate)

// 暂停时记得取消
cancelAnimationFrame(rafId)`

const App: FC = () => {
  const [count, setCount] = useState(0)
  const [other, setOther] = useState(0)

  // 故意传一个未 useCallback 的函数给 BadChild
  const badOnClick = () => {
    setOther((c) => c + 1)
  }
  // GoodChild 接收 useCallback 稳定函数
  const goodOnClick = useCallback(() => {
    setOther((c) => c + 1)
  }, [])

  const [tab, setTab] = useState<'memo' | 'virtual' | 'debounce' | 'raf'>('memo')

  return (
    <div className="app">
      <header className="header">
        <h1>02 渲染性能优化 (Rendering Performance)</h1>
        <p>
          通过 memo / useMemo / useCallback 减少不必要的 re-render，配合虚拟滚动、
          debounce、requestAnimationFrame 提升渲染流畅度。端口: 5271
        </p>
      </header>

      <Card title="策略总览" badge="overview">
        <ul className="list">
          <li>
            <strong>React.memo</strong>: 包裹函数组件，浅比较 props 避免重渲染
          </li>
          <li>
            <strong>useMemo</strong>: 缓存昂贵计算结果，依赖不变时复用
          </li>
          <li>
            <strong>useCallback</strong>: 缓存函数引用，作为 props 传递时不会触发子组件更新
          </li>
          <li>
            <strong>虚拟滚动 (Virtual List)</strong>: 1 万条数据只渲染可见的 10 条 DOM
          </li>
          <li>
            <strong>Debounce / Throttle</strong>: 高频事件 (输入/滚动/resize) 降频
          </li>
          <li>
            <strong>requestAnimationFrame</strong>: 动画与刷新率同步，告别丢帧
          </li>
          <li>
            <strong>合理使用 key</strong>: 列表 diff 时帮助 React 复用节点
          </li>
          <li>
            <strong>避免内联对象/函数</strong>: 防止 props 引用每次变化
          </li>
        </ul>
      </Card>

      <Card title="memo / useCallback 演示" badge="render count">
        <div className="row" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={() => setCount((c) => c + 1)}>
            更新父组件 count: {count}
          </button>
          <span className="counter">other: {other}</span>
          <span className="stat">点击按钮，观察左右子组件渲染次数差异</span>
        </div>
        <div className="compare">
          <BadChild label="未优化按钮" onClick={badOnClick} />
          <GoodChild label="memo 按钮" onClick={goodOnClick} />
        </div>
        <div className="note">
          父组件每次 setState 都会重渲染，<strong>BadChild</strong> 因 props.onClick
          每次新建而被重渲染；
          <strong> GoodChild</strong> 因 memo + useCallback 在 props 不变时跳过渲染。
        </div>
      </Card>

      <Card title="虚拟滚动演示" badge="10000 rows">
        <div className="row" style={{ marginBottom: 10 }}>
          <span className="counter">
            数据量: <b>10000</b>
          </span>
          <span className="counter">
            DOM 节点: <b>~10</b>
          </span>
          <span className="stat">滚动列表，观察流畅度</span>
        </div>
        <VirtualList itemCount={10000} itemHeight={40} windowHeight={320} />
      </Card>

      <Card title="Debounce 搜索演示" badge="debounce">
        <SearchDemo />
      </Card>

      <Card title="requestAnimationFrame 动画" badge="rAF">
        <RAFDemo />
      </Card>

      <Card title="代码示例" badge="code">
        <div className="row" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
          {(['memo', 'virtual', 'debounce', 'raf'] as const).map((t) => (
            <button
              key={t}
              className={'btn outline ' + (tab === t ? '' : '')}
              style={
                tab === t ? { background: '#0ea5e9', color: '#fff', borderColor: '#0ea5e9' } : {}
              }
              onClick={() => setTab(t)}
            >
              {t === 'memo'
                ? 'memo/useCallback'
                : t === 'virtual'
                  ? '虚拟滚动'
                  : t === 'debounce'
                    ? 'Debounce'
                    : 'rAF'}
            </button>
          ))}
        </div>
        <pre className="code">
          {tab === 'memo'
            ? memoCode
            : tab === 'virtual'
              ? virtualCode
              : tab === 'debounce'
                ? debounceCode
                : rafCode}
        </pre>
      </Card>

      <Card title="渲染次数对比" badge="before / after">
        <div className="compare">
          <div className="col">
            <h4>
              <span className="tag red">优化前</span>
            </h4>
            <ul className="list">
              <li>每次父更新 -{'>'} 全部子组件 re-render</li>
              <li>10000 条列表全量渲染 DOM</li>
              <li>输入框每次按键触发搜索</li>
              <li>setInterval 动画可能丢帧</li>
              <li>昂贵计算每次都重新执行</li>
            </ul>
            <div className="stat">渲染次数: ~10x</div>
          </div>
          <div className="col">
            <h4>
              <span className="tag green">优化后</span>
            </h4>
            <ul className="list">
              <li>memo + useCallback -{'>'} 仅必要子组件重渲染</li>
              <li>虚拟列表只渲染可见 10 条</li>
              <li>debounce 400ms 后才搜索</li>
              <li>rAF 与刷新率同步</li>
              <li>useMemo 缓存计算结果</li>
            </ul>
            <div className="stat">渲染次数: ~1x (-90%)</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default App
