import { useCallback, useState, CSSProperties } from 'react'

interface InteractionPanelProps {
  onTriggerLayoutShift: () => void
  shiftInjected: boolean
}

/**
 * 交互面板：
 * 1. 主线程阻塞按钮 - 触发长任务，影响 INP
 * 2. 布局偏移按钮 - 注入无尺寸元素，影响 CLS
 */
export default function InteractionPanel({ onTriggerLayoutShift, shiftInjected }: InteractionPanelProps) {
  const [blockCount, setBlockCount] = useState(0)
  const [blocking, setBlocking] = useState(false)

  // 模拟主线程阻塞（同步长任务）
  const handleBlock = useCallback(() => {
    setBlocking(true)
    const start = performance.now()
    // 同步阻塞主线程 ~300ms，制造较差的 INP
    while (performance.now() - start < 300) {
      // 空循环
    }
    setBlockCount((c) => c + 1)
    setBlocking(false)
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

  const btnRowStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  }

  const btnStyle = (color: string): CSSProperties => ({
    padding: '10px 18px',
    border: `2px solid ${color}`,
    borderRadius: '8px',
    backgroundColor: `${color}11`,
    color: color,
    cursor: blocking ? 'wait' : 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s',
  })

  const statStyle: CSSProperties = {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#555',
  }

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>交互触发器（影响 INP / CLS）</h3>
      <p style={descStyle}>
        点击下面的按钮会真实地产生性能事件。PerformanceObserver 会捕获这些事件并更新上方指标。
        INP 通过点击「主线程阻塞」按钮触发；CLS 通过「注入布局偏移」按钮触发。
      </p>
      <div style={btnRowStyle}>
        <button style={btnStyle('#ff9800')} onClick={handleBlock} disabled={blocking}>
          {blocking ? '阻塞中…' : '主线程阻塞 300ms（INP）'}
        </button>
        <button
          style={btnStyle('#f44336')}
          onClick={onTriggerLayoutShift}
          disabled={shiftInjected}
        >
          {shiftInjected ? '已注入偏移' : '注入布局偏移（CLS）'}
        </button>
      </div>
      <div style={statStyle}>
        已触发的长任务点击次数：<strong>{blockCount}</strong>
        {blockCount > 0 && <span> - 这些点击会让 INP 数值上升，可在指标卡片中观察。</span>}
      </div>
    </div>
  )
}
