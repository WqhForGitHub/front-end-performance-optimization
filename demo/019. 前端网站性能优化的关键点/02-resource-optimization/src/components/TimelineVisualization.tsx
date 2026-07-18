import { CSSProperties } from 'react'
import type { TimelineStage } from '../data/techniques'

interface TimelineVisualizationProps {
  title: string
  stages: TimelineStage[]
  /** 总时间轴长度（ms），用于按比例显示 */
  totalSpan: number
  /** 是否为优化后的版本 */
  optimized: boolean
}

/**
 * 资源加载时间线可视化
 * 把每个阶段渲染为按比例宽度的色条，并显示总耗时
 */
export default function TimelineVisualization({
  title,
  stages,
  totalSpan,
  optimized,
}: TimelineVisualizationProps) {
  const wrapperStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: optimized ? '2px solid #4caf5055' : '2px solid #f4433655',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  }

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '15px',
    fontWeight: 700,
    color: '#333',
  }

  const tagStyle: CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '10px',
    backgroundColor: optimized ? '#e8f5e9' : '#ffebee',
    color: optimized ? '#2e7d32' : '#c62828',
    border: `1px solid ${optimized ? '#4caf50' : '#f44336'}`,
  }

  const totalMs = stages.reduce((max, s) => Math.max(max, s.start + s.duration), 0)

  const totalStyle: CSSProperties = {
    fontSize: '12px',
    color: '#999',
    marginBottom: '12px',
  }

  const trackStyle: CSSProperties = {
    position: 'relative',
    height: '40px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '12px',
  }

  const stageLabelRowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }

  const legendItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#555',
  }

  const swatchStyle = (color: string): CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    backgroundColor: color,
    flexShrink: 0,
  })

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <h4 style={titleStyle}>{title}</h4>
        <span style={tagStyle}>{optimized ? '已优化' : '未优化'}</span>
      </div>
      <div style={totalStyle}>
        总耗时：<strong style={{ color: optimized ? '#2e7d32' : '#c62828' }}>{totalMs}ms</strong>
        {optimized && (
          <span style={{ color: '#2e7d32', marginLeft: '8px' }}>
            {'->'} 较未优化节省 {Math.max(0, totalSpan - totalMs)}ms
          </span>
        )}
      </div>

      <div style={trackStyle}>
        {stages.map((stage, idx) => {
          const leftPct = (stage.start / totalSpan) * 100
          const widthPct = (stage.duration / totalSpan) * 100
          const barStyle: CSSProperties = {
            position: 'absolute',
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: '100%',
            backgroundColor: stage.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 600,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            borderRight: '1px solid rgba(255,255,255,0.4)',
          }
          return (
            <div key={idx} style={barStyle} title={`${stage.name}: ${stage.note}`}>
              {widthPct > 12 ? stage.name : ''}
            </div>
          )
        })}
      </div>

      <div style={stageLabelRowStyle}>
        {stages.map((stage, idx) => (
          <div key={idx} style={legendItemStyle}>
            <span style={swatchStyle(stage.color)} />
            <span style={{ fontWeight: 600, minWidth: '90px' }}>{stage.name}</span>
            <span style={{ color: '#999' }}>
              {stage.start}ms - {stage.start + stage.duration}ms（{stage.duration}ms）
            </span>
            <span style={{ color: '#aaa' }}>{stage.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
