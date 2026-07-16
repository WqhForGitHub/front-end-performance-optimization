import { useState, useEffect, useRef, useCallback } from 'react'
import { useThrottledCallback } from '../hooks/useThrottle'

interface LogEntry {
  time: string
  type: 'raw' | 'throttled'
  value: number
}

/**
 * 滚动节流演示
 *
 * 展示节流的工作原理：
 * 1. 每次滚动都会记录「原始事件」
 * 2. 节流后每 200ms 最多触发一次处理函数
 * 3. 通过时间线可视化展示节流效果
 */
export default function ScrollDemo() {
  const [scrollTop, setScrollTop] = useState(0)
  const [throttledScrollTop, setThrottledScrollTop] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const rawCountRef = useRef(0)
  const throttledCountRef = useRef(0)

  // 节流回调：每 200ms 最多执行一次
  const handleThrottledScroll = useThrottledCallback((value: number) => {
    throttledCountRef.current++
    setThrottledScrollTop(value)
    setLogs((prev) => [
      ...prev.slice(-15),
      {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        type: 'throttled',
        value: Math.round(value),
      },
    ])
  }, 200)

  const handleScroll = useCallback((e: { target: HTMLElement }) => {
    const top = e.target.scrollTop
    rawCountRef.current++
    setScrollTop(top)
    setLogs((prev) => [
      ...prev.slice(-15),
      {
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        type: 'raw',
        value: Math.round(top),
      },
    ])
    handleThrottledScroll(top)
  }, [handleThrottledScroll])

  const containerStyle: Record<string, string | number | undefined> = {
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e0e0',
  }

  const scrollContainerStyle: Record<string, string | number | undefined> = {
    height: '200px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    padding: '16px',
    marginBottom: '16px',
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
    color: type === 'throttled' ? '#4caf50' : '#999',
  })

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        在下方区域滚动，观察原始事件和节流后事件的触发频率差异：
      </div>

      <div style={scrollContainerStyle} onScroll={handleScroll}>
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              fontSize: '14px',
              color: '#666',
            }}
          >
            滚动内容行 {i + 1} - 继续滚动以触发更多事件
          </div>
        ))}
      </div>

      <div style={statsStyle}>
        <span style={statStyle}>
          原始事件: <strong style={{ color: '#999' }}>{rawCountRef.current}</strong> 次
        </span>
        <span style={statStyle}>
          节流后: <strong style={{ color: '#4caf50' }}>{throttledCountRef.current}</strong> 次
        </span>
        <span style={statStyle}>
          节流间隔: <strong>200ms</strong>
        </span>
        <span style={statStyle}>
          节流位置: <strong style={{ color: '#ff9800' }}>{Math.round(throttledScrollTop)}px</strong>
        </span>
      </div>

      <div style={logContainerStyle}>
        {logs.length === 0 && (
          <div style={{ padding: '8px', color: '#ccc', fontSize: '13px' }}>滚动上方区域查看事件日志...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} style={logEntryStyle(log.type)}>
            <span style={{ color: '#ccc' }}>{log.time}</span>
            <span style={{ fontWeight: 'bold', minWidth: '70px' }}>
              [{log.type === 'raw' ? '原始' : '节流'}]
            </span>
            <span>scrollTop: {log.value}px</span>
          </div>
        ))}
      </div>
    </div>
  )
}
