import { useCallback, useState, CSSProperties } from 'react'
import { useWebVitals } from './hooks/useWebVitals'
import MetricCard from './components/MetricCard'
import ThresholdTable from './components/ThresholdTable'
import MetricHistory from './components/MetricHistory'
import InteractionPanel from './components/InteractionPanel'

/**
 * Core Web Vitals 监控演示
 *
 * 使用 PerformanceObserver API 实时采集三大核心指标：
 * - LCP（最大内容绘制）：页面主要内容渲染时间
 * - CLS（累计布局偏移）：视觉稳定性
 * - INP（交互到下一次绘制）：交互响应速度（取代 FID）
 *
 * 演示要点：
 * 1. 实时显示指标数值和颜色评级徽章（良好 / 需改进 / 较差）
 * 2. 提供阈值对照表
 * 3. 提供交互触发器，让用户真实地影响 INP / CLS 并观察指标变化
 */
export default function App() {
  const { metrics, history } = useWebVitals()
  const [shiftInjected, setShiftInjected] = useState(false)

  const handleTriggerLayoutShift = useCallback(() => {
    setShiftInjected(true)
  }, [])

  const pageStyle: CSSProperties = {
    maxWidth: '960px',
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

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  }

  const sectionStyle: CSSProperties = {
    marginBottom: '24px',
  }

  const sectionTitleStyle: CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 12px 0',
    color: '#333',
    borderLeft: '4px solid #1976d2',
    paddingLeft: '12px',
  }

  const noteStyle: CSSProperties = {
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#1565c0',
    lineHeight: '1.6',
    marginBottom: '24px',
  }

  const shiftBoxStyle: CSSProperties = {
    padding: '16px',
    border: '1px dashed #f44336',
    borderRadius: '8px',
    backgroundColor: '#fff3e0',
    marginTop: '16px',
    fontSize: '13px',
    color: '#c62828',
    lineHeight: '1.6',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Core Web Vitals 实时监控</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          使用 PerformanceObserver API 采集 LCP / CLS / INP，实时评估用户体验
        </p>
      </div>

      <div style={noteStyle}>
        <strong>说明：</strong>下方指标通过浏览器原生 PerformanceObserver 采集。首次加载会自动产生
        LCP； 点击「主线程阻塞」按钮会让 INP 变差；点击「注入布局偏移」按钮会让 CLS
        上升。请观察颜色徽章的变化。
      </div>

      <div style={gridStyle}>
        <MetricCard
          metric={metrics.LCP}
          description="最大内容绘制：页面中最大的可见元素完成渲染的时间。衡量加载性能。"
        />
        <MetricCard
          metric={metrics.CLS}
          description="累计布局偏移：页面生命周期内累计的意外布局移动量。衡量视觉稳定性。"
        />
        <MetricCard
          metric={metrics.INP}
          description="交互到下一次绘制：用户交互后到页面响应的时间。衡量交互响应速度。"
        />
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>阈值标准</h2>
        <ThresholdTable
          currentRatings={{
            LCP: metrics.LCP.rating,
            CLS: metrics.CLS.rating,
            INP: metrics.INP.rating,
          }}
        />
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>交互触发器</h2>
        <InteractionPanel
          onTriggerLayoutShift={handleTriggerLayoutShift}
          shiftInjected={shiftInjected}
        />
        {shiftInjected && (
          <div style={shiftBoxStyle}>
            已注入布局偏移：下方黄色占位框在渲染后突然出现，挤压了下方内容，产生 CLS。
            <div
              style={{
                height: '60px',
                backgroundColor: '#ffcc80',
                borderRadius: '4px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
              }}
            >
              突然出现的占位元素（无预留空间）
            </div>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>采集历史</h2>
        <MetricHistory history={history} />
      </div>
    </div>
  )
}
