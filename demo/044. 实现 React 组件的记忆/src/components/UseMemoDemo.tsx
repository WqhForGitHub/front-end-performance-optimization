import { useState, useMemo, useEffect, useRef } from 'react'

/**
 * useMemo 演示
 *
 * 原理：仅在依赖变化时重新计算，否则复用上次结果
 *
 * 使用场景：
 * 1. 昂贵的计算
 * 2. 稳定对象/数组引用（传递给被 memo 的子组件）
 */
export default function UseMemoDemo() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const renderCount = useRef(0)
  const expensiveCalcCount = useRef(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    renderCount.current += 1
    forceUpdate((n) => n + 1)
  })

  // 昂贵的计算 - 仅当 count 变化时重新计算
  const expensiveValue = useMemo(() => {
    expensiveCalcCount.current += 1
    // 模拟昂贵计算
    let result = 0
    for (let i = 0; i < 10000; i++) {
      result += i
    }
    return result + count
  }, [count])

  // 稳定对象引用 - 即使组件 re-render，对象引用也不变
  const stableConfig = useMemo(
    () => ({
      label: '稳定配置',
      version: '1.0.0',
    }),
    [],
  )

  return (
    <div style={cardStyle}>
      <h3 style={h3Style}>2. useMemo 演示</h3>
      <p style={descStyle}>
        useMemo 缓存计算结果，仅当依赖变化时才重新计算；输入文字不应触发昂贵的计算
      </p>
      <div style={infoStyle}>
        <span>count：{count}</span>
        <span>计算结果：{expensiveValue}</span>
        <span>
          渲染次数：<strong style={{ color: '#3b82f6' }}>{renderCount.current}</strong>
        </span>
        <span>
          计算执行次数：<strong style={{ color: '#ef4444' }}>{expensiveCalcCount.current}</strong>
        </span>
      </div>
      <input
        style={inputStyle}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        placeholder="输入文字会触发 re-render，但不会触发昂贵计算"
      />
      <button style={btnStyle} onClick={() => setCount((c) => c + 1)}>
        count + 1（触发重新计算）
      </button>
      <p style={tipStyle}>stableConfig.label: {stableConfig.label}</p>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: 8,
  marginBottom: 16,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#1e40af',
  fontSize: 16,
}
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#1e3a8a',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 12,
  fontSize: 13,
}
const inputStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 13,
  marginRight: 8,
  marginBottom: 8,
}
const btnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
const tipStyle: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: 12,
  color: '#6b7280',
}
