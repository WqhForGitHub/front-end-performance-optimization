import { useMemo, useState } from 'react'
import type { CSSProperties, FC } from 'react'

const TOTAL = 1000
const PAGE_SIZES = [10, 20, 50]

interface Item {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

const generateItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `商品 ${String(i + 1).padStart(4, '0')}`,
    category: `分类 ${(i % 12) + 1}`,
    price: Math.round((Math.sin(i * 0.7) + 1) * 250) + 10,
    stock: Math.round((Math.cos(i * 1.3) + 1) * 50),
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

const btnBase: CSSProperties = {
  border: '1px solid #8b5cf6',
  background: '#8b5cf6',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  minWidth: 36,
}

const ghostBtnStyle: CSSProperties = {
  ...btnBase,
  background: '#fff',
  color: '#8b5cf6',
}

const activePageStyle: CSSProperties = {
  ...btnBase,
  background: '#7c3aed',
  borderColor: '#7c3aed',
}

const disabledBtnStyle: CSSProperties = {
  ...ghostBtnStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
}

const dangerBtnStyle: CSSProperties = {
  ...btnBase,
  borderColor: '#ef4444',
  background: '#ef4444',
}

const sizeBtnActiveStyle: CSSProperties = {
  ...btnBase,
  background: '#1f2933',
  borderColor: '#1f2933',
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
  position: 'sticky',
  top: 0,
}

const tdStyle: CSSProperties = {
  border: '1px solid #e2e8f0',
  padding: '8px 10px',
  textAlign: 'left',
}

const scrollPortStyle: CSSProperties = {
  height: 440,
  overflow: 'auto',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  background: '#fff',
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

const inputStyle: CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 14,
  width: 64,
}

const labelStyle: CSSProperties = { fontSize: 13, color: '#64748b' }

const PageNumber: FC<{
  page: number
  current: number
  onJump: (p: number) => void
}> = ({ page, current, onJump }) => {
  const isActive = page === current
  return (
    <button style={isActive ? activePageStyle : ghostBtnStyle} onClick={() => onJump(page)}>
      {page}
    </button>
  )
}

const Pagination: FC<{
  total: number
  pageSize: number
  current: number
  onJump: (p: number) => void
}> = ({ total, pageSize, current, onJump }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // build a windowed page list around current page
  const pages: number[] = []
  const win = 2
  const start = Math.max(1, current - win)
  const end = Math.min(totalPages, current + win)
  for (let i = start; i <= end; i++) pages.push(i)

  const goFirst = () => onJump(1)
  const goPrev = () => onJump(Math.max(1, current - 1))
  const goNext = () => onJump(Math.min(totalPages, current + 1))
  const goLast = () => onJump(totalPages)

  return (
    <div style={{ ...rowStyle, justifyContent: 'center', marginTop: 12 }}>
      <button
        style={current === 1 ? disabledBtnStyle : ghostBtnStyle}
        onClick={goFirst}
        disabled={current === 1}
      >
        首页
      </button>
      <button
        style={current === 1 ? disabledBtnStyle : ghostBtnStyle}
        onClick={goPrev}
        disabled={current === 1}
      >
        上一页
      </button>
      {start > 1 ? <span style={labelStyle}>...</span> : null}
      {pages.map((p) => (
        <PageNumber key={p} page={p} current={current} onJump={onJump} />
      ))}
      {end < totalPages ? <span style={labelStyle}>...</span> : null}
      <button
        style={current === totalPages ? disabledBtnStyle : ghostBtnStyle}
        onClick={goNext}
        disabled={current === totalPages}
      >
        下一页
      </button>
      <button
        style={current === totalPages ? disabledBtnStyle : ghostBtnStyle}
        onClick={goLast}
        disabled={current === totalPages}
      >
        末页
      </button>
    </div>
  )
}

const App: FC = () => {
  const items = useMemo<Item[]>(() => generateItems(TOTAL), [])

  const [pageSize, setPageSize] = useState(20)
  const [current, setCurrent] = useState(1)
  const [jumpInput, setJumpInput] = useState('')
  const [showFull, setShowFull] = useState(false)

  const totalPages = Math.max(1, Math.ceil(TOTAL / pageSize))
  const safeCurrent = Math.min(current, totalPages)
  const startIdx = (safeCurrent - 1) * pageSize
  const endIdx = Math.min(TOTAL, startIdx + pageSize)
  const pageItems = items.slice(startIdx, endIdx)

  const handlePageSize = (size: number) => {
    setPageSize(size)
    setCurrent(1)
  }

  const handleJump = (p: number) => {
    setCurrent(Math.min(Math.max(1, p), totalPages))
  }

  const handleJumpInput = () => {
    const n = parseInt(jumpInput, 10)
    if (!Number.isNaN(n)) {
      handleJump(n)
      setJumpInput('')
    }
  }

  return (
    <div className="app" style={appStyle}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>02 - 分页（Pagination）</h1>
      <p className="subtitle" style={subtitleStyle}>
        共 {TOTAL.toLocaleString()} 条数据。分页只渲染当前页的少量节点（{pageSize} 个）， DOM
        压力小、首屏快；而一次性渲染全部 {TOTAL.toLocaleString()} 条会让浏览器一次性创建大量 DOM
        节点。
      </p>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>1. 实时统计</h2>
        <div className="stat-grid" style={statGridStyle}>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>总数据量</p>
            <p style={statValueStyle}>{TOTAL.toLocaleString()}</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>每页条数</p>
            <p style={statValueStyle}>{pageSize}</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>总页数</p>
            <p style={statValueStyle}>{totalPages}</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <p style={statLabelStyle}>当前页渲染</p>
            <p style={statValueStyle}>{pageItems.length}</p>
          </div>
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>2. 分页列表（推荐）</h2>

        <div style={{ ...rowStyle, marginBottom: 12 }}>
          <span style={labelStyle}>每页条数：</span>
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              style={size === pageSize ? sizeBtnActiveStyle : ghostBtnStyle}
              onClick={() => handlePageSize(size)}
            >
              {size}
            </button>
          ))}
          <span style={{ ...labelStyle, marginLeft: 'auto' }}>
            第 {safeCurrent} / {totalPages} 页 ｜ 显示 [{startIdx + 1}, {endIdx}] 共{' '}
            {pageItems.length} 条
          </span>
        </div>

        <div style={scrollPortStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 70 }}>ID</th>
                <th style={thStyle}>名称</th>
                <th style={{ ...thStyle, width: 100 }}>分类</th>
                <th style={{ ...thStyle, width: 100 }}>价格</th>
                <th style={{ ...thStyle, width: 90 }}>库存</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>#{item.id + 1}</td>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{item.category}</td>
                  <td style={{ ...tdStyle, color: '#7c3aed', fontWeight: 600 }}>¥{item.price}</td>
                  <td style={tdStyle}>{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination total={TOTAL} pageSize={pageSize} current={safeCurrent} onJump={handleJump} />

        <div style={{ ...rowStyle, justifyContent: 'center', marginTop: 12 }}>
          <span style={labelStyle}>跳转到：</span>
          <input
            style={inputStyle}
            value={jumpInput}
            placeholder="页码"
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleJumpInput()
            }}
          />
          <button style={ghostBtnStyle} onClick={handleJumpInput}>
            跳转
          </button>
        </div>

        <div style={noteStyle}>
          切换每页条数会重置到第 1 页。分页本质是「数据切片 + 只渲染当前切片」， 无论数据量多大，DOM
          节点数始终 ≤ pageSize，首屏稳定。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>3. 一次性渲染全部（谨慎）</h2>
        <div style={{ ...rowStyle, marginBottom: 12 }}>
          <button
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
          <div style={scrollPortStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 70 }}>ID</th>
                  <th style={thStyle}>名称</th>
                  <th style={{ ...thStyle, width: 100 }}>分类</th>
                  <th style={{ ...thStyle, width: 100 }}>价格</th>
                  <th style={{ ...thStyle, width: 90 }}>库存</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>#{item.id + 1}</td>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.category}</td>
                    <td style={{ ...tdStyle, color: '#7c3aed', fontWeight: 600 }}>¥{item.price}</td>
                    <td style={tdStyle}>{item.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={noteStyle}>
            点击后将一次性渲染全部 {TOTAL.toLocaleString()} 行，可直观对比首屏卡顿与内存占用。
          </div>
        )}
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>4. 分页核心逻辑</h2>
        <pre className="formula" style={codeStyle}>{`totalPages = ceil(total / pageSize)
            = ceil(${TOTAL} / ${pageSize}) = ${totalPages}

startIdx = (current - 1) * pageSize
         = (${safeCurrent} - 1) * ${pageSize} = ${startIdx}
endIdx   = min(total, startIdx + pageSize)
         = min(${TOTAL}, ${startIdx} + ${pageSize}) = ${endIdx}
pageItems = items.slice(startIdx, endIdx)  // 仅渲染 ${pageItems.length} 条`}</pre>
        <div style={noteStyle}>
          分页适合「按顺序浏览」的场景（表格、搜索结果）。配合服务端分页（仅请求当前页数据）可进一步降低网络与内存开销。
          与虚拟滚动相比，分页没有连续滚动的体验，但实现更简单、对 SEO 与 URL 友好。
        </div>
      </section>

      <section className="section" style={sectionStyle}>
        <h2 style={h2Style}>5. 分页 vs 虚拟滚动 vs 全量渲染</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>维度</th>
              <th style={thStyle}>分页</th>
              <th style={thStyle}>虚拟滚动</th>
              <th style={thStyle}>全量渲染</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>DOM 节点数</td>
              <td style={tdStyle}>= pageSize</td>
              <td style={tdStyle}>≈ 可视行数</td>
              <td style={tdStyle}>= 数据总量</td>
            </tr>
            <tr>
              <td style={tdStyle}>浏览体验</td>
              <td style={tdStyle}>翻页跳转</td>
              <td style={tdStyle}>连续滚动</td>
              <td style={tdStyle}>连续滚动（卡）</td>
            </tr>
            <tr>
              <td style={tdStyle}>实现难度</td>
              <td style={tdStyle}>低</td>
              <td style={tdStyle}>中（需处理滚动）</td>
              <td style={tdStyle}>最低</td>
            </tr>
            <tr>
              <td style={tdStyle}>服务端友好</td>
              <td style={tdStyle}>好（按页请求）</td>
              <td style={tdStyle}>需一次拉全量或分块</td>
              <td style={tdStyle}>需一次拉全量</td>
            </tr>
            <tr>
              <td style={tdStyle}>适用场景</td>
              <td style={tdStyle}>表格 / 搜索结果</td>
              <td style={tdStyle}>信息流 / 长列表</td>
              <td style={tdStyle}>少量数据</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
