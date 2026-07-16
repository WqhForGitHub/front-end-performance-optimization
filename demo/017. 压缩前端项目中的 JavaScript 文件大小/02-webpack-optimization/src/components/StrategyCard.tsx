import { CSSProperties } from 'react'
import type { OptimizationStrategy } from '../data/optimizationData'

interface StrategyCardProps {
  strategy: OptimizationStrategy
}

/**
 * 优化策略卡片：
 * - 顶部彩色条标识策略类别
 * - 中间显示策略名称、配置项、说明
 * - 底部进度条显示体积节省比例
 */
export function StrategyCard({ strategy }: StrategyCardProps) {
  const cardStyle: CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #eee',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }

  const topBarStyle: CSSProperties = {
    height: '4px',
    backgroundColor: strategy.color,
  }

  const contentStyle: CSSProperties = {
    padding: '14px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  }

  const nameStyle: CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    color: '#333',
    marginBottom: '4px',
  }

  const configStyle: CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: strategy.color,
    marginBottom: '8px',
    backgroundColor: '#f5f5f5',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-block',
    alignSelf: 'flex-start',
  }

  const descStyle: CSSProperties = {
    fontSize: '12px',
    color: '#666',
    lineHeight: 1.6,
    flex: 1,
    marginBottom: '10px',
  }

  const barTrackStyle: CSSProperties = {
    width: '100%',
    height: '6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    overflow: 'hidden',
  }

  const barFillStyle: CSSProperties = {
    width: `${Math.min(strategy.savedPercent, 100)}%`,
    height: '100%',
    backgroundColor: strategy.color,
    transition: 'width 0.5s ease',
  }

  const labelRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#888',
    marginTop: '4px',
  }

  return (
    <div style={cardStyle}>
      <div style={topBarStyle} />
      <div style={contentStyle}>
        <div style={nameStyle}>{strategy.name}</div>
        <div style={configStyle}>{strategy.config}</div>
        <div style={descStyle}>{strategy.desc}</div>
        <div style={barTrackStyle}>
          <div style={barFillStyle} />
        </div>
        <div style={labelRowStyle}>
          <span>体积节省</span>
          <span style={{ fontWeight: 700, color: strategy.color }}>
            {strategy.savedPercent > 0 ? `-${strategy.savedPercent}%` : '缓存优化'}
          </span>
        </div>
      </div>
    </div>
  )
}
