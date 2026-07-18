import { useState, useEffect, useRef, memo } from 'react'

interface Config {
  label: string
  color: string
}

interface GoodCounterProps {
  onAction: () => void
  config: Config
}

/**
 * 正例：优化后的子组件
 *
 * 优化点：
 * 1. React.memo：对 props 进行浅比较，相同则跳过渲染
 * 2. 父组件传入的 onAction 用 useCallback 稳定引用
 * 3. 父组件传入的 config 用 useMemo 稳定引用
 * 4. 状态下放：count 状态在本组件内部，不影响父组件
 *
 * 效果：父组件 re-render 时，本组件不会 re-render（props 未变）
 */
function GoodCounterBase({ onAction, config }: GoodCounterProps) {
  const [count, setCount] = useState(0)
  const renderCount = useRef(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    renderCount.current += 1
    forceUpdate((n) => n + 1)
  })

  return (
    <div style={cardStyle}>
      <h3 style={{ ...h3Style, color: config.color }}>{config.label}</h3>
      <p style={descStyle}>
        使用 React.memo + 父组件 useCallback/useMemo，父组件 re-render 不影响本组件
      </p>
      <div style={statStyle}>
        <span>计数：{count}</span>
        <span style={renderStyle}>渲染次数：{renderCount.current}</span>
      </div>
      <button style={goodBtnStyle} onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
      <button style={actionBtnStyle} onClick={onAction}>
        触发 action
      </button>
    </div>
  )
}

// React.memo：浅比较 props，相同则跳过渲染
const GoodCounter = memo(GoodCounterBase)

export default GoodCounter

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 16,
}
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#166534',
}
const statStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12,
  fontSize: 14,
}
const renderStyle: React.CSSProperties = {
  color: '#10b981',
  fontWeight: 600,
}
const goodBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  marginRight: 8,
}
const actionBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#fff',
  color: '#10b981',
  border: '1px solid #10b981',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
