import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FC } from 'react'

const TOTAL = 10000
const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 440
const OVERSCAN = 4

interface Item {
  id: number
  name: string
  category: string
}

const generateItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `项目 ${String(i + 1).padStart(5, '0')}`,
    category: `分类 ${(i % 12) + 1}`,
  }))

// ---------------- styles ----------------
const appStyle: CSSProperties = {
  maxWidth: 980,
  margin: '0 auto',
  padding: '24px 16px 64px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  color: '#1f2933',
  lineHeight: 1.6,
}

const subtitleStyle: CSSProperties = { color: '#64748b', marginTop: 0, marginBottom: 24 }

const sectionStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: 20,
  marginBottom: 20,
}

const h2Style: CSSProperties = {
  fontSize: 18,
  margin: '0 0 16px',
  borderLeft: '4px solid #8b5cf6',
  paddingLeft: 10,
}

const h3Style: CSSProperties = {
  fontSize: 15,
  margin: '0 0 10px',
  color: '#475569',
}

const rowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
  marginBottom: 12,
}

const btnBase: CSSProperties = {
  border: '1px solid #8b5cf6',
  background: '#8b5cf6',
  color: '#fff',
  padding: '6px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
}

const ghostBtnStyle: CSSProperties = {
  ...btnBase,
  background: '#fff',
  color: '#8b5cf6',
}

const darkBtnStyle: CSSProperties = {
  ...btnBase,
  background: '#1f2933',
  borderColor: '#1f2933',
}

const indicatorStyle: CSSProperties = {
  display: 'inline-block',
  background: '#1f2933',
  color: '#f8fafc',
  padding: '4px 10px',
  fontSize: 12,
  borderRadius: 4,
  marginBottom: 8,
  fontVariantNumeric: 'tabular-nums',
}

const scrollPortStyle: CSSProperties = {
  position: 'relative',
  height: VIEWPORT_HEIGHT,
  overflow: 'auto',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  background: '#fff',
}

const trackStyle = (height: number): CSSProperties => ({
  position: 'relative',
  width: '100%',
  height,
})

const virtualItemStyle = (top: number, highlight: boolean, isOdd: boolean): CSSProperties => ({
  position: 'absolute',
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderBottom: '1px solid #f1f5f9',
  background: highlight ? '#fef3c7' : isOdd ? '#fafbfc' : '#fff',
  fontSize: 14,
  height: ITEM_HEIGHT,
  top,
  boxShadow: highlight ? 'inset 3px 0 0 #f59e0b' : 'none',
})

const idxStyle: CSSProperties = {
  color: '#94a3b8',
  width: 80,
  fontVariantNumeric: 'tabular-nums',
}
const nameStyle: CSSProperties = { flex: 1 }
const tagStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  background: '#f1f5f9',
  padding: '2px 8px',
  borderRadius: 999,
  marginRight: 10,
}
const countStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  fontVariantNumeric: 'tabular-nums',
  width: 80,
  textAlign: 'right',
}
const highlightCountStyle: CSSProperties = {
  ...countStyle,
  color: '#b45309',
  fontWeight: 700,
}

const noteStyle: CSSProperties = {
  fontSize: 13,
  color: '#64748b',
  background: '#f8fafc',
  borderLeft: '3px solid #94a3b8',
  padding: '8px 12px',
  borderRadius: 4,
  marginTop: 12,
}

const codeStyle: CSSProperties = {
  fontFamily: 'SFMono-Regular, Consolas, monospace',
  background: '#0f172a',
  color: '#e2e8f0',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 13,
  overflowX: 'auto',
  margin: 0,
  whiteSpace: 'pre',
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
}

const thStyle: CSSProperties = {
  border: '1px solid #e2e8f0',
  padding: '8px 10px',
  textAlign: 'left',
  background: '#f1f5f9',
  verticalAlign: 'top',
}

const tdStyle: CSSProperties = {
  border: '1px solid #e2e8f0',
  padding: '8px 10px',
  textAlign: 'left',
  verticalAlign: 'top',
}

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 12,
  background: '#ecfdf5',
  color: '#047857',
  border: '1px solid #a7f3d0',
}

const badBadgeStyle: CSSProperties = {
  ...badgeStyle,
  background: '#fee2e2',
  color: '#b91c1c',
  borderColor: '#fecaca',
}

const twoColStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
}

const colStyle: CSSProperties = {
  border: '1px dashed #cbd5e1',
  borderRadius: 8,
  padding: 12,
  background: '#f8fafc',
}

const miniRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderBottom: '1px solid #eef2f7',
  fontSize: 14,
  background: '#fff',
}

const keyListStyle: CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  overflow: 'hidden',
  marginTop: 4,
}

const keyRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderBottom: '1px solid #eef2f7',
  fontSize: 14,
  background: '#fff',
}

const miniBtnStyle: CSSProperties = {
  border: '1px solid #8b5cf6',
  background: '#fff',
  color: '#8b5cf6',
  padding: '2px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
}

// ---------------- Section 1: virtual scroll + memo ----------------
interface RowProps {
  id: number
  name: string
  category: string
  highlight: boolean
}

const VirtualRowBase: FC<RowProps> = ({ id, name, category, highlight }) => {
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <div style={virtualItemStyle(id * ITEM_HEIGHT, highlight, id % 2 === 1)}>
      <span style={idxStyle}>#{id + 1}</span>
      <span style={nameStyle}>{name}</span>
      <span style={tagStyle}>{category}</span>
      <span style={highlight ? highlightCountStyle : countStyle}>渲染 {renderCount.current}</span>
    </div>
  )
}

const VirtualRow = memo(VirtualRowBase)

const VirtualMemoList: FC<{
  items: Item[]
  tick: number
  highlightId: number
}> = ({ items, tick, highlightId }) => {
  const portRef = useRef<HTMLDivElement>()
  const [scrollTop, setScrollTop] = useState(0)

  const handleScroll = () => {
    if (portRef.current) setScrollTop(portRef.current.scrollTop)
  }

  const total = items.length
  const totalHeight = total * ITEM_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(
    total,
    Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ITEM_HEIGHT) + OVERSCAN,
  )
  const visibleItems = items.slice(startIndex, endIndex)

  return (
    <div>
      <div className="indicator" style={indicatorStyle}>
        tick = {tick} ｜ scrollTop = {scrollTop}px ｜ 可见区间 [{startIndex}, {endIndex}) ｜
        实际渲染 {visibleItems.length} / {total} ｜ 高亮项 #{highlightId + 1}
      </div>
      <div ref={portRef} className="scroll-port" style={scrollPortStyle} onScroll={handleScroll}>
        <div className="virtual-track" style={trackStyle(totalHeight)}>
          {visibleItems.map((item) => (
            <VirtualRow
              key={item.id}
              id={item.id}
              name={item.name}
              category={item.category}
              highlight={item.id === highlightId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------- Section 2: memo vs plain ----------------
interface MiniProps {
  id: number
  name: string
}

const PlainRow: FC<MiniProps> = ({ id, name }) => {
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <div style={miniRowStyle}>
      <span style={idxStyle}>#{id + 1}</span>
      <span style={nameStyle}>{name}</span>
      <span style={countStyle}>渲染 {renderCount.current}</span>
    </div>
  )
}

const MemoRow = memo(PlainRow)

const MemoCompare: FC<{ tick: number }> = ({ tick }) => {
  const items = useMemo<Item[]>(() => generateItems(6), [])
  return (
    <div style={twoColStyle}>
      <div style={colStyle}>
        <h3 style={h3Style}>无 memo：父组件每次 tick 都全部重渲染</h3>
        {items.map((it) => (
          <PlainRow key={it.id} id={it.id} name={it.name} />
        ))}
      </div>
      <div style={colStyle}>
        <h3 style={h3Style}>React.memo：props 不变则跳过重渲染</h3>
        {items.map((it) => (
          <MemoRow key={it.id} id={it.id} name={it.name} />
        ))}
      </div>
    </div>
  )
}

// ---------------- Section 3: stable key vs index key ----------------
interface KeyItemData {
  id: number
  name: string
}

const KeyRow: FC<{ item: KeyItemData }> = ({ item }) => {
  const [clicks, setClicks] = useState(0)
  return (
    <div style={keyRowStyle}>
      <span style={idxStyle}>#{item.id + 1}</span>
      <span style={nameStyle}>{item.name}</span>
      <span style={{ ...countStyle, width: 'auto', marginRight: 4 }}>点击 {clicks}</span>
      <button style={miniBtnStyle} onClick={() => setClicks((c) => c + 1)}>
        +1
      </button>
    </div>
  )
}

const KeyDemo: FC = () => {
  const [order, setOrder] = useState<KeyItemData[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({ id: i, name: `卡片 ${i + 1}` })),
  )
  const [useIndexKey, setUseIndexKey] = useState(false)

  const shuffle = () => {
    setOrder((prev) => {
      const next = [...prev]
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = next[i]
        next[i] = next[j]
        next[j] = tmp
      }
      return next
    })
  }

  return (
    <div>
      <div style={rowStyle}>
        <button style={darkBtnStyle} onClick={shuffle}>
          随机打乱顺序
        </button>
        <button style={ghostBtnStyle} onClick={() => setUseIndexKey((v) => !v)}>
          当前 key 策略：{useIndexKey ? '索引 key（index）' : '稳定 key（item.id）'} ｜ 点击切换
        </button>
        <span style={useIndexKey ? badBadgeStyle : badgeStyle}>
          {useIndexKey ? 'index key：状态会跟随位置错乱' : 'id key：状态跟随数据项'}
        </span>
      </div>
      <div style={keyListStyle}>
        {order.map((item, i) => (
          <KeyRow key={useIndexKey ? i : item.id} item={item} />
        ))}
      </div>
      <div style={noteStyle}>
        操作步骤：1) 给「卡片 1」点几下 +1；2) 点击「随机打乱顺序」。 使用稳定 id 作为 key 时，卡片
        1 的点击数会跟着它一起移动到新位置； 使用数组索引 index 作为 key
        时，点击数会「留在原来的位置」，从而显示在错误的卡片上。
      </div>
    </div>
  )
}

// ---------------- App ----------------
const App: FC = () => {
  const items = useMemo<Item[]>(() => generateItems(TOTAL), [])
  const [tick, setTick] = useState(0)
  const [auto, setAuto] = useState(false)
  const [highlightId, setHighlightId] = useState<number>(-1)

  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => setTick((v) => v + 1), 1000)
    return () => clearInterval(t)
  }, [auto])

  const toggleHighlight = () => setHighlightId((v) => (v === 5 ? -1 : 5))

  return (
    <div className="app" style={appStyle}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>03 - 窗口化 + key + memo</h1>
      <p className="subtitle" style={subtitleStyle}>
        把「虚拟滚动（窗口化）」「稳定的 key」「React.memo」三件套组合起来， 是 React
        长列表性能优化的最佳实践：只渲染可视区、避免无谓重渲染、保证状态与数据正确对应。
      </p>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>1. 虚拟滚动 + React.memo</h2>
        <div style={rowStyle}>
          <button style={btnBase} onClick={() => setTick((v) => v + 1)}>
            手动 tick（{tick}）
          </button>
          <button style={auto ? ghostBtnStyle : darkBtnStyle} onClick={() => setAuto((v) => !v)}>
            {auto ? '停止自动 tick' : '开始自动 tick（1s）'}
          </button>
          <button style={ghostBtnStyle} onClick={toggleHighlight}>
            {highlightId === 5 ? '取消高亮 #6' : '高亮 #6（仅该项重渲染）'}
          </button>
          <span style={badgeStyle}>tick = {tick}</span>
        </div>
        <VirtualMemoList items={items} tick={tick} highlightId={highlightId} />
        <div style={noteStyle}>
          每一行都被 React.memo 包裹，props 为基础类型。点击「手动 tick」让父组件重新渲染：
          因为没有任何一行的 props 改变，所有行都被 memo 跳过，右侧「渲染 N」计数不增长。 点击「高亮
          #6」时只有 #6 这一行（highlight 由 false 变 true）会重渲染，其余行依旧跳过。 这就是
          memo「只重渲染发生变化的项」的效果。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>2. memo vs 无 memo 对比</h2>
        <div style={rowStyle}>
          <button style={btnBase} onClick={() => setTick((v) => v + 1)}>
            触发父组件重渲染（tick {tick}）
          </button>
          <span style={{ fontSize: 13, color: '#64748b' }}>观察左右两侧「渲染 N」计数的差异</span>
        </div>
        <MemoCompare tick={tick} />
        <div style={noteStyle}>
          左侧 PlainRow 未被 memo 包裹，父组件每次 tick 都会重新渲染全部 6 行，计数持续增长； 右侧
          MemoRow 被 memo 包裹且 props（id、name）未变，React 直接复用上一次结果，计数停在初始值。
          注意：memo 做的是浅比较，若传入「每次新建的对象 / 函数」作为 props，memo 会失效，需要配合
          useMemo / useCallback。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>3. 稳定 key vs 索引 key</h2>
        <KeyDemo />
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>4. 为什么组合使用？</h2>
        <pre
          className="formula"
          style={codeStyle}
        >{`// 1. 窗口化：只渲染可视区，DOM 节点 ≈ viewportHeight / itemHeight
const start = max(0, floor(scrollTop / itemHeight) - overscan)
const end   = min(total, ceil((scrollTop + viewportHeight) / itemHeight) + overscan)
const visible = items.slice(start, end)

// 2. 稳定 key：用唯一且不变的 id，保证数据项与组件实例一一对应
{visible.map(it => <Row key={it.id} {...it} />)}

// 3. React.memo：props 不变则跳过重渲染
const Row = memo(function Row(props) { ... })

// 三者叠加：DOM 数量恒定 + 重渲染范围最小 + 状态不错乱`}</pre>
        <div style={noteStyle}>
          窗口化解决「DOM 太多」，memo 解决「重渲染太多」，稳定 key 解决「实例与数据错位」。
          三者解决的是不同层面的问题，组合使用才能既快又正确。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>5. 三板斧对照表</h2>
        <table className="cmp" style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>手段</th>
              <th style={thStyle}>解决的问题</th>
              <th style={thStyle}>代价 / 注意点</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>虚拟滚动（窗口化）</td>
              <td style={tdStyle}>DOM 节点过多导致首屏慢、滚动卡</td>
              <td style={tdStyle}>需计算可见区间；变高列表需额外处理</td>
            </tr>
            <tr>
              <td style={tdStyle}>React.memo</td>
              <td style={tdStyle}>父组件重渲染时子组件无谓重渲染</td>
              <td style={tdStyle}>浅比较；传入新对象/函数会失效，需 useMemo/useCallback</td>
            </tr>
            <tr>
              <td style={tdStyle}>稳定 key（item.id）</td>
              <td style={tdStyle}>列表顺序变化时状态错乱、重渲染异常</td>
              <td style={tdStyle}>key 必须唯一且稳定；避免用数组索引</td>
            </tr>
            <tr>
              <td style={tdStyle}>分页</td>
              <td style={tdStyle}>一次性数据量过大</td>
              <td style={tdStyle}>非连续浏览；适合表格 / 搜索结果</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
