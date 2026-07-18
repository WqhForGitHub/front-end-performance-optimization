import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, FC } from 'react'

const TOTAL = 10000
const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 480
const OVERSCAN = 4

interface Item {
  id: number
  name: string
  category: string
  price: number
}

const generateItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `商品 ${String(i + 1).padStart(5, '0')}`,
    category: `分类 ${(i % 12) + 1}`,
    price: Math.round((Math.sin(i * 0.7) + 1) * 250) + 10,
  }))

const appStyle: CSSProperties = {
  maxWidth: 960,
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

const rowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
}

const btnStyle: CSSProperties = {
  border: '1px solid #8b5cf6',
  background: '#8b5cf6',
  color: '#fff',
  padding: '6px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
}

const dangerBtnStyle: CSSProperties = {
  ...btnStyle,
  borderColor: '#ef4444',
  background: '#ef4444',
}

const ghostBtnStyle: CSSProperties = {
  ...btnStyle,
  background: '#fff',
  color: '#8b5cf6',
}

const statGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 12,
  marginBottom: 16,
}

const statCardStyle: CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '10px 12px',
  background: '#f8fafc',
}

const statLabelStyle: CSSProperties = { color: '#64748b', fontSize: 12, margin: 0 }
const statValueStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: '#7c3aed',
  fontVariantNumeric: 'tabular-nums',
  margin: '2px 0 0',
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

const itemStyle = (top: number, isOdd: boolean): CSSProperties => ({
  position: 'absolute',
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderBottom: '1px solid #f1f5f9',
  background: isOdd ? '#fafbfc' : '#fff',
  fontSize: 14,
  height: ITEM_HEIGHT,
  top,
})

const fullItemStyle = (isOdd: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderBottom: '1px solid #f1f5f9',
  background: isOdd ? '#fafbfc' : '#fff',
  fontSize: 14,
  height: ITEM_HEIGHT,
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
  marginRight: 8,
}
const priceStyle: CSSProperties = {
  color: '#7c3aed',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  width: 80,
  textAlign: 'right',
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

const progressTrackStyle: CSSProperties = {
  height: 6,
  background: '#e2e8f0',
  borderRadius: 999,
  overflow: 'hidden',
  marginTop: 4,
}

const progressFillStyle = (pct: number): CSSProperties => ({
  height: '100%',
  width: `${pct}%`,
  background: 'linear-gradient(90deg,#8b5cf6,#ec4899)',
  transition: 'width .12s',
})

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
  const pct = total === 0 ? 0 : Math.min(100, (scrollTop / (totalHeight - VIEWPORT_HEIGHT)) * 100)

  return (
    <div>
      <div className="indicator" style={indicatorStyle}>
        scrollTop = {scrollTop}px ｜ 可见区间 [{startIndex}, {endIndex}) ｜ 实际渲染{' '}
        {visibleItems.length} / {total} ｜ 滚动进度 {pct.toFixed(1)}%
      </div>
      <div style={progressTrackStyle}>
        <div style={progressFillStyle(pct)} />
      </div>
      <div
        ref={portRef}
        className="scroll-port"
        onScroll={handleScroll}
        style={{ ...scrollPortStyle, marginTop: 8 }}
      >
        <div className="virtual-track" style={trackStyle(totalHeight)}>
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="virtual-item"
              style={itemStyle(item.id * ITEM_HEIGHT, item.id % 2 === 1)}
            >
              <span style={idxStyle}>#{item.id + 1}</span>
              <span style={nameStyle}>{item.name}</span>
              <span style={tagStyle}>{item.category}</span>
              <span style={priceStyle}>¥{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FullList: FC<{ items: Item[] }> = ({ items }) => (
  <div className="scroll-port" style={scrollPortStyle}>
    {items.map((item) => (
      <div key={item.id} style={fullItemStyle(item.id % 2 === 1)}>
        <span style={idxStyle}>#{item.id + 1}</span>
        <span style={nameStyle}>{item.name}</span>
        <span style={tagStyle}>{item.category}</span>
        <span style={priceStyle}>¥{item.price}</span>
      </div>
    ))}
  </div>
)

const App: FC = () => {
  const items = useMemo<Item[]>(() => generateItems(TOTAL), [])
  const [showFull, setShowFull] = useState(false)

  const capacity = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + OVERSCAN * 2

  return (
    <div className="app" style={appStyle}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>01 - 虚拟滚动（Virtual Scrolling）</h1>
      <p className="subtitle" style={subtitleStyle}>
        共 {TOTAL.toLocaleString()} 条数据。虚拟列表只渲染可视区域内的少量节点（约 {capacity} 个），
        滚动时根据 scrollTop 动态替换；而全量渲染会把全部 {TOTAL.toLocaleString()} 个节点挂到 DOM
        上。
      </p>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>1. 实时统计（渲染数 vs 总数）</h2>
        <div className="stat-grid" style={statGridStyle}>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>总数据量</p>
            <p style={statValueStyle}>{TOTAL.toLocaleString()}</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>实际渲染节点</p>
            <p style={statValueStyle}>≈ {capacity}</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>渲染占比</p>
            <p style={statValueStyle}>{((capacity / TOTAL) * 100).toFixed(2)}%</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>单项高度</p>
            <p style={statValueStyle}>{ITEM_HEIGHT}px</p>
          </div>
        </div>
        <div style={noteStyle}>
          渲染占比仅 {((capacity / TOTAL) * 100).toFixed(2)}%，DOM 节点数与总数据量解耦。
          打开开发者工具 Elements 面板，滚动列表可以看到节点几乎不变。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>2. 虚拟列表（推荐）</h2>
        <VirtualList items={items} />
        <div style={noteStyle}>
          滚动时顶部指示器实时显示 scrollTop、可见区间 [startIndex, endIndex) 与实际渲染数量。
          无论数据量多大，渲染节点数始终 ≈ ceil(viewportHeight / itemHeight) + 2 * overscan。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>3. 全量渲染对比（谨慎）</h2>
        <div className="row" style={{ ...rowStyle, marginBottom: 12 }}>
          <button
            className="btn danger"
            style={showFull ? ghostBtnStyle : dangerBtnStyle}
            onClick={() => setShowFull((v) => !v)}
          >
            {showFull ? '卸载全量列表' : `挂载全量列表（${TOTAL.toLocaleString()} 个节点）`}
          </button>
          <span style={showFull ? badBadgeStyle : badgeStyle}>
            {showFull ? `DOM 节点数 ≈ ${TOTAL.toLocaleString()}` : '当前未挂载'}
          </span>
        </div>
        {showFull ? (
          <FullList items={items} />
        ) : (
          <div style={noteStyle}>
            点击按钮后将一次性渲染全部 {TOTAL.toLocaleString()} 个节点，
            可直观感受首屏卡顿、内存占用和滚动掉帧的差异。
          </div>
        )}
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>4. 可见区间计算公式</h2>
        <pre className="formula" style={codeStyle}>{`totalHeight = itemCount * itemHeight
            = ${TOTAL} * ${ITEM_HEIGHT} = ${(TOTAL * ITEM_HEIGHT).toLocaleString()}px

startIndex = max(0, floor(scrollTop / itemHeight) - overscan)
endIndex   = min(itemCount, ceil((scrollTop + viewportHeight) / itemHeight) + overscan)
rendered   = items.slice(startIndex, endIndex)

// 本例：viewportHeight = ${VIEWPORT_HEIGHT}, itemHeight = ${ITEM_HEIGHT}, overscan = ${OVERSCAN}
// 理论可见行数 = ceil(${VIEWPORT_HEIGHT} / ${ITEM_HEIGHT}) = ${Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT)}
// 实际渲染行数 ≈ ${Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT)} + 2 * ${OVERSCAN} = ${capacity}`}</pre>
        <div style={noteStyle}>
          overscan 是上下额外预渲染的行数，避免滚动时出现空白闪烁。
          定高列表的虚拟滚动实现最简单；变高列表需要缓存每项真实高度或使用 ResizeObserver。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>5. 虚拟列表 vs 全量渲染</h2>
        <table className="cmp" style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>维度</th>
              <th style={thStyle}>虚拟列表</th>
              <th style={thStyle}>全量渲染</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>DOM 节点数</td>
              <td style={tdStyle}>≈ viewportHeight / itemHeight + 2*overscan</td>
              <td style={tdStyle}>= 数据总量</td>
            </tr>
            <tr>
              <td style={tdStyle}>首屏渲染时间</td>
              <td style={tdStyle}>O(可视行数)，几乎恒定</td>
              <td style={tdStyle}>O(n)，随数据量线性增长</td>
            </tr>
            <tr>
              <td style={tdStyle}>内存占用</td>
              <td style={tdStyle}>低</td>
              <td style={tdStyle}>高（每个节点常驻 DOM）</td>
            </tr>
            <tr>
              <td style={tdStyle}>滚动流畅度</td>
              <td style={tdStyle}>需处理滚动 & 绝对定位</td>
              <td style={tdStyle}>原生滚动，节点多时卡顿</td>
            </tr>
            <tr>
              <td style={tdStyle}>适用场景</td>
              <td style={tdStyle}>长列表（数百 / 数万 / 数十万）</td>
              <td style={tdStyle}>少量数据（几十到几百）</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
