import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, FC } from 'react'

const TOTAL = 10000
const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 420
const OVERSCAN = 5

interface Item {
  id: number
  name: string
  tag: string
}

const plainItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: 14,
  height: ITEM_HEIGHT,
  background: '#fff',
}

const VirtualList: FC<{ items: Item[] }> = ({ items }) => {
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
      <div className="scroll-indicator">
        scrollTop = {scrollTop}px ｜ 可见区间 [{startIndex}, {endIndex}) ｜ 实际渲染{' '}
        {visibleItems.length} / {total} ｜ 每项高度 {ITEM_HEIGHT}px
      </div>
      <div
        ref={portRef}
        className="scroll-port"
        onScroll={handleScroll}
        style={{ height: VIEWPORT_HEIGHT }}
      >
        <div className="virtual-track" style={{ height: totalHeight }}>
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="virtual-item"
              style={{ top: item.id * ITEM_HEIGHT, height: ITEM_HEIGHT }}
            >
              <span className="idx">#{item.id + 1}</span>
              <span className="name">{item.name}</span>
              <span className="tag">{item.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FullList: FC<{ items: Item[] }> = ({ items }) => (
  <div className="scroll-port" style={{ height: VIEWPORT_HEIGHT }}>
    {items.map((item) => (
      <div key={item.id} style={plainItemStyle}>
        <span className="idx">#{item.id + 1}</span>
        <span className="name">{item.name}</span>
        <span className="tag">{item.tag}</span>
      </div>
    ))}
  </div>
)

const App: FC = () => {
  const items = useMemo<Item[]>(() => {
    return Array.from({ length: TOTAL }, (_, i) => ({
      id: i,
      name: `项目 #${i + 1}`,
      tag: `分类 ${(i % 8) + 1}`,
    }))
  }, [])

  const [showFull, setShowFull] = useState(false)

  return (
    <div className="app">
      <h1>虚拟列表（Virtual Scrolling）</h1>
      <p className="subtitle">
        共 {TOTAL} 条数据。虚拟列表只渲染可视区域内的少量节点，滚动时动态替换；而全量渲染会把{' '}
        {TOTAL} 个节点全部挂到 DOM 上。
      </p>

      <section className="section">
        <h2>1. 虚拟列表（推荐）</h2>
        <VirtualList items={items} />
        <div className="note" style={{ marginTop: 12 }}>
          打开开发者工具 Elements 面板查看：滚动时 DOM 节点数始终维持在几十个，与总数据量无关。
        </div>
      </section>

      <section className="section">
        <h2>2. 全量渲染对比（谨慎）</h2>
        <div className="row" style={{ marginBottom: 12 }}>
          <button className="btn danger" onClick={() => setShowFull((v) => !v)}>
            {showFull ? '卸载全量列表' : `挂载全量列表（${TOTAL} 个节点）`}
          </button>
          <span className={showFull ? 'badge bad' : 'badge'}>
            {showFull ? `DOM 节点数 ≈ ${TOTAL}` : '当前未挂载'}
          </span>
        </div>
        {showFull ? (
          <FullList items={items} />
        ) : (
          <div className="note">
            点击按钮后将一次性渲染全部 {TOTAL} 个节点，可直观感受首屏卡顿和内存占用差异。
          </div>
        )}
      </section>

      <section className="section">
        <h2>3. 可见区间计算公式</h2>
        <pre className="formula">{`totalHeight = itemCount * itemHeight
// = ${TOTAL} * ${ITEM_HEIGHT} = ${TOTAL * ITEM_HEIGHT}px

startIndex = max(0, floor(scrollTop / itemHeight) - overscan)
endIndex   = min(itemCount, ceil((scrollTop + viewportHeight) / itemHeight) + overscan)
rendered   = items.slice(startIndex, endIndex)`}</pre>
        <div className="note" style={{ marginTop: 12 }}>
          overscan 是上下额外预渲染的行数，避免滚动时出现空白。无论数据量多大，渲染节点数 ≈
          ceil(viewportHeight / itemHeight) + 2 * overscan。
        </div>
      </section>

      <section className="section">
        <h2>4. 虚拟列表 vs 全量渲染</h2>
        <table className="cmp">
          <thead>
            <tr>
              <th>维度</th>
              <th>虚拟列表</th>
              <th>全量渲染</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DOM 节点数</td>
              <td>约 viewportHeight / itemHeight + overscan</td>
              <td>= 数据总量</td>
            </tr>
            <tr>
              <td>首屏渲染时间</td>
              <td>O(可视行数)，几乎恒定</td>
              <td>O(n)，随数据量线性增长</td>
            </tr>
            <tr>
              <td>内存占用</td>
              <td>低</td>
              <td>高（每个节点都常驻 DOM）</td>
            </tr>
            <tr>
              <td>滚动流畅度</td>
              <td>需正确处理滚动 & 绝对定位</td>
              <td>原生滚动，但节点多时卡顿</td>
            </tr>
            <tr>
              <td>适用场景</td>
              <td>长列表（数百 / 数万 / 数十万）</td>
              <td>少量数据（几十到几百）</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
