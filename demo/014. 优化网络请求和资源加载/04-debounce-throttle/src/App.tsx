import { useState } from 'react'
import SearchDemo from './components/SearchDemo'
import ScrollDemo from './components/ScrollDemo'

/**
 * 防抖节流优化演示
 *
 * 对比展示防抖（Debounce）和节流（Throttle）的原理和效果：
 * 1. 防抖 - 搜索输入框：用户停止输入后才触发请求
 * 2. 节流 - 滚动事件：限制事件处理频率，每 200ms 最多执行一次
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'debounce' | 'throttle'>('debounce')

  const pageStyle: Record<string, string | number | undefined> = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const tabContainerStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  }

  const tabStyle = (active: boolean): Record<string, string | number | undefined> => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    border: '2px solid',
    borderColor: active ? '#1976d2' : '#e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? '#e3f2fd' : 'transparent',
    color: active ? '#1976d2' : '#999',
    fontWeight: active ? 'bold' : 'normal',
    fontSize: '15px',
    transition: 'all 0.2s',
  })

  const descStyle: Record<string, string | number | undefined> = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const compareStyle: Record<string, string | number | undefined> = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  }

  const compareCardStyle = (color: string): Record<string, string | number | undefined> => ({
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: `${color}11`,
    border: `1px solid ${color}44`,
  })

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>防抖节流优化</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          控制高频事件的触发频率，优化网络请求和性能
        </p>
      </div>

      <div style={compareStyle}>
        <div style={compareCardStyle('#1976d2')}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '16px' }}>防抖 (Debounce)</h3>
          <p style={{ margin: '0', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            在事件停止触发 N 毫秒后执行。适合搜索输入、表单验证等场景，
            避免用户输入过程中频繁发送请求。
          </p>
        </div>
        <div style={compareCardStyle('#ff9800')}>
          <h3 style={{ margin: '0 0 8px 0', color: '#ff9800', fontSize: '16px' }}>节流 (Throttle)</h3>
          <p style={{ margin: '0', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            每 N 毫秒最多执行一次。适合滚动、resize 等持续触发的事件，
            保证响应频率的同时控制执行次数。
          </p>
        </div>
      </div>

      <div style={tabContainerStyle}>
        <div style={tabStyle(activeTab === 'debounce')} onClick={() => setActiveTab('debounce')}>
          防抖 - 搜索输入
        </div>
        <div style={tabStyle(activeTab === 'throttle')} onClick={() => setActiveTab('throttle')}>
          节流 - 滚动事件
        </div>
      </div>

      {activeTab === 'debounce' && (
        <div>
          <div style={descStyle}>
            <strong>防抖场景：</strong>在搜索框中快速输入文字，每次输入都会触发事件日志。
            但搜索请求只有在用户停止输入 <strong>500ms</strong> 后才会发出。
            对比「输入次数」和「请求次数」的差异。
          </div>
          <SearchDemo />
        </div>
      )}

      {activeTab === 'throttle' && (
        <div>
          <div style={descStyle}>
            <strong>节流场景：</strong>在上方区域滚动，每次滚动都会记录原始事件。
            但节流后每 <strong>200ms</strong> 最多处理一次。
            对比「原始事件」和「节流后」的触发次数差异。
          </div>
          <ScrollDemo />
        </div>
      )}
    </div>
  )
}
