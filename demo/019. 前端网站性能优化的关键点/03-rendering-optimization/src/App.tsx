import { useState, CSSProperties } from 'react'
import DebounceDemo from './components/DebounceDemo'
import AnimationDemo from './components/AnimationDemo'
import VirtualScrollDemo from './components/VirtualScrollDemo'

type Tab = 'debounce' | 'animation' | 'virtual'

/**
 * 渲染优化演示
 *
 * 涵盖三种渲染层面的优化手段：
 * 1. 防抖（Debounce）：减少高频事件触发的高成本计算/渲染
 * 2. requestAnimationFrame：把动画对齐到浏览器刷新帧，避免丢帧与无效重绘
 * 3. 虚拟滚动：长列表只渲染可视区域，避免一次性创建海量 DOM 节点
 *
 * 每个演示都提供「优化前 vs 优化后」的对比和量化指标。
 */
export default function App() {
  const [tab, setTab] = useState<Tab>('debounce')

  const pageStyle: CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const tabRowStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  }

  const tabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    border: '2px solid',
    borderColor: active ? '#1976d2' : '#e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? '#e3f2fd' : 'transparent',
    color: active ? '#1976d2' : '#999',
    fontWeight: active ? 700 : 400,
    fontSize: '14px',
    transition: 'all 0.2s',
  })

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'debounce', label: '防抖输入' },
    { key: 'animation', label: 'requestAnimationFrame' },
    { key: 'virtual', label: '虚拟滚动' },
  ]

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>渲染优化策略</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          防抖、requestAnimationFrame、虚拟滚动 - 减少不必要的渲染与重绘
        </p>
      </div>

      <div style={tabRowStyle}>
        {tabs.map((t) => (
          <div key={t.key} style={tabStyle(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'debounce' && <DebounceDemo />}
      {tab === 'animation' && <AnimationDemo />}
      {tab === 'virtual' && <VirtualScrollDemo />}
    </div>
  )
}
