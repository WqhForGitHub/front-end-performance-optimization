import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'

interface LogEntry {
  time: string
  type: 'input' | 'debounced' | 'request'
  value: string
}

/**
 * 防抖搜索演示
 *
 * 展示防抖的工作原理：
 * 1. 用户每次输入都会记录「输入事件」
 * 2. 防抖后的值只有在用户停止输入 500ms 后才更新
 * 3. 防抖值变化后触发「搜索请求」
 *
 * 通过时间线可视化展示防抖效果。
 */
export default function SearchDemo() {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 500)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const inputCountRef = useRef(0)

  // 记录每次输入
  useEffect(() => {
    if (inputValue === '') return
    inputCountRef.current++
    setLogs((prev) => [
      ...prev.slice(-15),
      {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        type: 'input',
        value: inputValue,
      },
    ])
  }, [inputValue])

  // 防抖值变化时模拟搜索请求
  useEffect(() => {
    if (debouncedValue === '') return
    setLogs((prev) => [
      ...prev.slice(-15),
      {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        type: 'request',
        value: debouncedValue,
      },
    ])
  }, [debouncedValue])

  const containerStyle: Record<string, string | number | undefined> = {
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e0e0',
  }

  const inputStyle: Record<string, string | number | undefined> = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
  }

  const statsStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    fontSize: '13px',
  }

  const statStyle: Record<string, string | number | undefined> = {
    padding: '6px 14px',
    borderRadius: '6px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
  }

  const logContainerStyle: Record<string, string | number | undefined> = {
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    padding: '8px',
  }

  const logEntryStyle = (type: string): Record<string, string | number | undefined> => ({
    display: 'flex',
    gap: '8px',
    padding: '4px 8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: type === 'request' ? '#4caf50' : type === 'debounced' ? '#ff9800' : '#999',
  })

  return (
    <div style={containerStyle}>
      <input
        type="text"
        value={inputValue}
        onChange={(e: { target: { value: string } }) => setInputValue(e.target.value)}
        placeholder="快速输入文字，观察防抖效果..."
        style={inputStyle}
        autoFocus
      />

      <div style={statsStyle}>
        <span style={statStyle}>
          输入次数: <strong style={{ color: '#999' }}>{inputCountRef.current}</strong>
        </span>
        <span style={statStyle}>
          请求次数: <strong style={{ color: '#4caf50' }}>
            {logs.filter((l) => l.type === 'request').length}
          </strong>
        </span>
        <span style={statStyle}>
          防抖延迟: <strong>500ms</strong>
        </span>
        <span style={statStyle}>
          当前值: <strong style={{ color: '#ff9800' }}>"{debouncedValue}"</strong>
        </span>
      </div>

      <div style={logContainerStyle}>
        {logs.length === 0 && (
          <div style={{ padding: '8px', color: '#ccc', fontSize: '13px' }}>事件日志将显示在这里...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} style={logEntryStyle(log.type)}>
            <span style={{ color: '#ccc' }}>{log.time}</span>
            <span style={{ fontWeight: 'bold', minWidth: '70px' }}>
              [{log.type === 'input' ? '输入' : log.type === 'request' ? '请求' : '防抖'}]
            </span>
            <span>"{log.value}"</span>
          </div>
        ))}
      </div>
    </div>
  )
}
