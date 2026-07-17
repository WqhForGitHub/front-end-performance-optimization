import { useMemo, useState, CSSProperties, ChangeEvent } from 'react'
import { useDebouncedValue } from '../hooks/useDebounce'

/** 模拟一个包含大量数据的列表 */
const mockDatabase = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  name: `项目 ${String(i + 1).padStart(4, '0')}`,
  category: ['电子产品', '图书', '服装', '食品', '家居'][i % 5],
  price: Math.floor(Math.random() * 1000) + 10,
}))

/**
 * 防抖输入演示
 * 左侧：直接使用输入值进行过滤（每次按键都触发完整过滤 + 渲染）
 * 右侧：使用 useDebouncedValue 防抖（停止输入 300ms 后才过滤）
 * 对比「按键次数」与「过滤执行次数」。
 */
export default function DebounceDemo() {
  const [immediateValue, setImmediateValue] = useState('')
  const [debounceValue, setDebounceValue] = useState('')
  const [keyCount, setKeyCount] = useState(0)
  const [immediateFilterCount, setImmediateFilterCount] = useState(0)
  const [debounceFilterCount, setDebounceFilterCount] = useState(0)

  const debouncedValue = useDebouncedValue(debounceValue, 300)

  // 立即过滤
  const immediateResults = useMemo(() => {
    setImmediateFilterCount((c) => c + 1)
    if (!immediateValue.trim()) return mockDatabase.slice(0, 8)
    const q = immediateValue.toLowerCase()
    return mockDatabase.filter((item) => item.name.toLowerCase().includes(q) || item.category.includes(immediateValue)).slice(0, 8)
  }, [immediateValue])

  // 防抖过滤
  const debouncedResults = useMemo(() => {
    setDebounceFilterCount((c) => c + 1)
    if (!debouncedValue.trim()) return mockDatabase.slice(0, 8)
    const q = debouncedValue.toLowerCase()
    return mockDatabase.filter((item) => item.name.toLowerCase().includes(q) || item.category.includes(debouncedValue)).slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  const handleImmediateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyCount((c) => c + 1)
    setImmediateValue(e.target.value)
  }
  const handleDebounceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyCount((c) => c + 1)
    setDebounceValue(e.target.value)
  }

  const wrapperStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  }

  const panelStyle = (color: string): CSSProperties => ({
    border: `2px solid ${color}33`,
    borderRadius: '8px',
    padding: '14px',
    backgroundColor: `${color}08`,
  })

  const labelStyle: CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px',
    display: 'block',
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const statRowStyle: CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '10px',
    fontSize: '12px',
    color: '#666',
  }

  const listStyle: CSSProperties = {
    marginTop: '12px',
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #f0f0f0',
    borderRadius: '6px',
  }

  const itemStyle: CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid #f5f5f5',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
  }

  const descStyle: CSSProperties = {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  }

  const statBoxStyle: CSSProperties = {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    gap: '24px',
    fontSize: '13px',
  }

  return (
    <div style={wrapperStyle}>
      <p style={descStyle}>
        在两个输入框中快速输入文字（模拟搜索）。左侧每次按键都立即过滤 5000 条数据，
        右侧使用 <code style={{ backgroundColor: '#f0f0f0', padding: '1px 5px', borderRadius: '3px' }}>useDebouncedValue(300ms)</code>，
        仅在停止输入后才过滤。对比过滤执行次数差异。
      </p>

      <div style={statBoxStyle}>
        <span>总按键次数：<strong style={{ color: '#1976d2' }}>{keyCount}</strong></span>
        <span>立即过滤执行：<strong style={{ color: '#f44336' }}>{immediateFilterCount}</strong> 次</span>
        <span>防抖过滤执行：<strong style={{ color: '#4caf50' }}>{debounceFilterCount}</strong> 次</span>
      </div>

      <div style={gridStyle}>
        <div style={panelStyle('#f44336')}>
          <label style={labelStyle}>立即过滤（无防抖）</label>
          <input
            style={inputStyle}
            value={immediateValue}
            onChange={handleImmediateChange}
            placeholder="快速输入文字…"
          />
          <div style={statRowStyle}>
            <span>结果数：{immediateResults.length}</span>
          </div>
          <div style={listStyle}>
            {immediateResults.map((item) => (
              <div key={item.id} style={itemStyle}>
                <span>{item.name}</span>
                <span style={{ color: '#999' }}>¥{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={panelStyle('#4caf50')}>
          <label style={labelStyle}>防抖过滤（300ms）</label>
          <input
            style={inputStyle}
            value={debounceValue}
            onChange={handleDebounceChange}
            placeholder="快速输入文字…"
          />
          <div style={statRowStyle}>
            <span>结果数：{debouncedResults.length}</span>
            <span style={{ color: '#4caf50' }}>当前值："{debouncedValue}"</span>
          </div>
          <div style={listStyle}>
            {debouncedResults.map((item) => (
              <div key={item.id} style={itemStyle}>
                <span>{item.name}</span>
                <span style={{ color: '#999' }}>¥{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
