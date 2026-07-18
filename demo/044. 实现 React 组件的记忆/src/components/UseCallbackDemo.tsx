import { memo, useState, useEffect, useRef } from 'react'

interface Props {
  onAction: () => void
}

/**
 * useCallback 演示
 *
 * 原理：useCallback(fn, deps) === useMemo(() => fn, deps)
 * 稳定函数引用，避免函数每次重新创建
 *
 * 关键场景：传递给被 React.memo 包裹的子组件时，必须用 useCallback 稳定引用
 */
function UseCallbackDemoBase({ onAction }: Props) {
  const [count, setCount] = useState(0)
  const renderCount = useRef(0)
  const actionCount = useRef(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    renderCount.current += 1
    forceUpdate((n) => n + 1)
  })

  return (
    <div style={cardStyle}>
      <h3 style={h3Style}>3. useCallback 演示</h3>
      <p style={descStyle}>
        useCallback 稳定函数引用；父组件 re-render 时本组件不渲染，但点击按钮仍能正常调用
      </p>
      <div style={infoStyle}>
        <span>count：{count}</span>
        <span>
          渲染次数：<strong style={{ color: '#10b981' }}>{renderCount.current}</strong>
        </span>
        <span>
          action 调用次数：<strong style={{ color: '#3b82f6' }}>{actionCount.current}</strong>
        </span>
      </div>
      <button style={btnStyle} onClick={() => setCount((c) => c + 1)}>
        内部 +1
      </button>
      <button
        style={btnActionStyle}
        onClick={() => {
          actionCount.current += 1
          onAction()
          forceUpdate((n) => n + 1)
        }}
      >
        触发 onAction
      </button>
      <p style={tipStyle}>
        提示：父组件 re-render 不会触发本组件渲染（渲染次数不变），但 onAction 仍能正常调用
      </p>
    </div>
  )
}

const UseCallbackDemo = memo(UseCallbackDemoBase)

export default UseCallbackDemo

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: 8,
  marginBottom: 16,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#92400e',
  fontSize: 16,
}
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#78350f',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 12,
  fontSize: 13,
}
const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#f59e0b',
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
  color: '#f59e0b',
  border: '1px solid #f59e0b',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
const tipStyle: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: 12,
  color: '#78350f',
}
