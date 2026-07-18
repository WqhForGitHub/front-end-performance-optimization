import { useCallback, useMemo, useRef, useState, CSSProperties, useEffect } from 'react'
import { useRafThrottle } from '../hooks/useRafThrottle'

interface ListItem {
  id: number
  name: string
  value: number
}

const TOTAL = 10000
const ITEM_HEIGHT = 36
const VISIBLE_HEIGHT = 360

function generateData(count: number): ListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `行 #${String(i + 1).padStart(5, '0')}`,
    value: Math.floor((Math.sin(i * 0.3) + 1) * 500),
  }))
}

const allData = generateData(TOTAL)

/**
 * 虚拟滚动演示
 * 左侧：一次性渲染全部 10000 行（卡顿、占用大量 DOM 节点）
 * 右侧：虚拟滚动，只渲染可视区域 + 上下缓冲的少量行
 */
export default function VirtualScrollDemo() {
  const [mode, setMode] = useState<'all' | 'virtual'>('virtual')
  const [scrollTop, setScrollTop] = useState(0)
  const [renderedCount, setRenderedCount] = useState(0)
  const [renderTime, setRenderTime] = useState(0)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // 虚拟滚动计算
  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 3)
    const endIndex = Math.min(TOTAL, Math.ceil((scrollTop + VISIBLE_HEIGHT) / ITEM_HEIGHT) + 3)
    const items = allData.slice(startIndex, endIndex).map((item, i) => ({
      ...item,
      index: startIndex + i,
    }))
    return {
      visibleItems: items,
      totalHeight: TOTAL * ITEM_HEIGHT,
      offsetY: startIndex * ITEM_HEIGHT,
    }
  }, [scrollTop])

  useEffect(() => {
    setRenderedCount(mode === 'virtual' ? visibleItems.length : TOTAL)
  }, [mode, visibleItems.length])

  // 用 rAF 节流滚动事件
  const handleScroll = useRafThrottle((e: { currentTarget: HTMLDivElement }) => {
    if (mode !== 'virtual') return
    setScrollTop(e.currentTarget.scrollTop)
  })

  const switchMode = useCallback((next: 'all' | 'virtual') => {
    const t0 = performance.now()
    setMode(next)
    // 测量渲染耗时（下一帧）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRenderTime(Math.round(performance.now() - t0))
      })
    })
  }, [])

  const wrapperStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  const titleStyle: CSSProperties = {
    margin: '0 0 8px 0',
    fontSize: '17px',
    fontWeight: 700,
    color: '#333',
  }

  const descStyle: CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
  }

  const tabRowStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  }

  const tabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    border: '2px solid',
    borderColor: active ? '#1976d2' : '#e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? '#e3f2fd' : 'transparent',
    color: active ? '#1976d2' : '#999',
    fontWeight: active ? 700 : 400,
    fontSize: '14px',
  })

  const statBoxStyle: CSSProperties = {
    display: 'flex',
    gap: '24px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '13px',
  }

  const scrollWrapperStyle: CSSProperties = {
    height: `${VISIBLE_HEIGHT}px`,
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    position: 'relative',
  }

  const rowStyle = (color: string): CSSProperties => ({
    height: `${ITEM_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid #f5f5f5',
    fontSize: '13px',
    boxSizing: 'border-box',
    borderLeft: `3px solid ${color}`,
  })

  const indexStyle: CSSProperties = {
    color: '#1976d2',
    fontFamily: 'monospace',
    fontWeight: 600,
  }

  const valueBarStyle = (value: number): CSSProperties => ({
    width: `${(value / 1000) * 120}px`,
    height: '8px',
    backgroundColor: '#4caf50',
    borderRadius: '4px',
  })

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>长列表渲染对比（{TOTAL.toLocaleString()} 行）</h3>
      <p style={descStyle}>
        切换「全量渲染」与「虚拟滚动」对比。全量渲染会一次性创建 {TOTAL.toLocaleString()} 个 DOM
        节点， 切换时明显卡顿；虚拟滚动只创建可视区域内的 ~
        {Math.ceil(VISIBLE_HEIGHT / ITEM_HEIGHT) + 6} 个节点， 滚动流畅。滚动事件使用
        requestAnimationFrame 节流。
      </p>

      <div style={tabRowStyle}>
        <div style={tabStyle(mode === 'virtual')} onClick={() => switchMode('virtual')}>
          虚拟滚动（推荐）
        </div>
        <div style={tabStyle(mode === 'all')} onClick={() => switchMode('all')}>
          全量渲染（卡顿）
        </div>
      </div>

      <div style={statBoxStyle}>
        <span>
          当前模式：<strong>{mode === 'virtual' ? '虚拟滚动' : '全量渲染'}</strong>
        </span>
        <span>
          DOM 节点数：
          <strong style={{ color: mode === 'virtual' ? '#4caf50' : '#f44336' }}>
            {renderedCount.toLocaleString()}
          </strong>
        </span>
        <span>
          切换渲染耗时：
          <strong style={{ color: renderTime > 100 ? '#f44336' : '#4caf50' }}>
            {renderTime}ms
          </strong>
        </span>
        <span>总数据量：{TOTAL.toLocaleString()}</span>
      </div>

      <div ref={scrollContainerRef} style={scrollWrapperStyle} onScroll={handleScroll}>
        {mode === 'virtual' ? (
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: `${offsetY}px`, left: 0, right: 0 }}>
              {visibleItems.map((item) => (
                <div key={item.id} style={rowStyle('#4caf50')}>
                  <span style={indexStyle}>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={valueBarStyle(item.value)} />
                    <span style={{ color: '#999', fontSize: '12px', width: '40px' }}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {allData.map((item) => (
              <div key={item.id} style={rowStyle('#f44336')}>
                <span style={indexStyle}>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={valueBarStyle(item.value)} />
                  <span style={{ color: '#999', fontSize: '12px', width: '40px' }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
        {'->'} 在上方列表中上下滚动，虚拟滚动模式下只渲染可见行
      </div>
    </div>
  )
}
