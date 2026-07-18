import { memo, useState, useEffect, useRef } from 'react'

interface Props {
  title: string
  onClick: () => void
}

/**
 * React.memo 演示
 *
 * 原理：对 props 做浅比较，相同则跳过渲染，复用上次的渲染结果
 *
 * 需要：
 * - 父组件传入的 onClick 用 useCallback 稳定引用
 * - 父组件传入的 title 是基本类型，浅比较有效
 */
function MemoDemoBase({ title, onClick }: Props) {
  const [count, setCount] = useState(0)
  const renderCount = useRef(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    renderCount.current += 1
    forceUpdate((n) => n + 1)
  })

  return (
    <div style={cardStyle}>
      <h3 style={h3Style}>1. React.memo 演示</h3>
      <p style={descStyle}>
        使用 React.memo 包裹，父组件 re-render 时本组件不会渲染（props 浅相等）
      </p>
      <div style={infoStyle}>
        <span>title：{title}</span>
        <span>
          渲染次数：<strong style={{ color: '#10b981' }}>{renderCount.current}</strong>
        </span>
      </div>
      <button style={btnStyle} onClick={() => setCount((c) => c + 1)}>
        内部计数：{count}
      </button>
      <button style={btnActionStyle} onClick={onClick}>
        触发 onClick
      </button>
    </div>
  )
}

// React.memo 记忆组件
const MemoDemo = memo(MemoDemoBase)

export default MemoDemo

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: 8,
  marginBottom: 16,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#15803d',
  fontSize: 16,
}
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#166534',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  marginBottom: 12,
  fontSize: 14,
}
const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  marginRight: 8,
}
const btnActionStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#fff',
  color: '#10b981',
  border: '1px solid #10b981',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
