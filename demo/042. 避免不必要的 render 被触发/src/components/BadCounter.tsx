import { useState, useEffect, useRef } from 'react'

interface Config {
  label: string
  color: string
}

/**
 * 反例：未优化的子组件
 *
 * 问题：
 * 1. 未使用 React.memo，父组件任何 re-render 都会触发本组件 re-render
 * 2. 父组件传入的 onAction 和 config 每次都是新引用
 * 3. 即使 props 内容相同，引用不同也会触发渲染
 */
export default function BadCounter() {
  const [count, setCount] = useState(0)
  const renderCount = useRef(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    renderCount.current += 1
    forceUpdate((n) => n + 1)
  })

  // 每次渲染都创建新的对象和函数（演示反例）
  const config: Config = {
    label: '未优化的计数器',
    color: '#ef4444',
  }

  const handleAction = () => {
     
    console.log('Bad action')
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ ...h3Style, color: config.color }}>{config.label}</h3>
      <p style={descStyle}>
        未使用 React.memo，父组件每次 re-render 都会触发本组件渲染
      </p>
      <div style={statStyle}>
        <span>计数：{count}</span>
        <span style={renderStyle}>渲染次数：{renderCount.current}</span>
      </div>
      <button style={badBtnStyle} onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
      <button style={actionBtnStyle} onClick={handleAction}>
        触发 action
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 16,
}
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#991b1b',
}
const statStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12,
  fontSize: 14,
}
const renderStyle: React.CSSProperties = {
  color: '#ef4444',
  fontWeight: 600,
}
const badBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#ef4444',
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
  color: '#ef4444',
  border: '1px solid #ef4444',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
