import { CSSProperties } from 'react'
import type { MetricRecord, Rating } from '../hooks/useWebVitals'

interface MetricHistoryProps {
  history: MetricRecord[]
}

const nameColor: Record<'LCP' | 'CLS' | 'INP', string> = {
  LCP: '#1976d2',
  CLS: '#9c27b0',
  INP: '#ff9800',
}

const ratingLabel: Record<Rating, string> = {
  good: '良好',
  'needs-improvement': '需改进',
  poor: '较差',
  pending: '采集中',
}

export default function MetricHistory({ history }: MetricHistoryProps) {
  const wrapperStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  const titleStyle: CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '17px',
    fontWeight: 700,
    color: '#333',
  }

  const listStyle: CSSProperties = {
    maxHeight: '280px',
    overflowY: 'auto',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
  }

  const emptyStyle: CSSProperties = {
    padding: '24px',
    textAlign: 'center',
    color: '#999',
    fontSize: '13px',
  }

  if (history.length === 0) {
    return (
      <div style={wrapperStyle}>
        <h3 style={titleStyle}>指标采集历史</h3>
        <div style={emptyStyle}>暂无采集记录，请与页面交互（点击按钮）以触发指标上报。</div>
      </div>
    )
  }

  const reversed = [...history].reverse()

  const rowStyle = (rating: Rating): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '60px 1fr 80px 100px 120px',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderBottom: '1px solid #f5f5f5',
    fontSize: '13px',
  })

  const tagStyle = (name: 'LCP' | 'CLS' | 'INP'): CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: `${nameColor[name]}22`,
    color: nameColor[name],
    fontWeight: 700,
    fontSize: '12px',
    textAlign: 'center',
  })

  const ratingTag = (rating: Rating): CSSProperties => {
    const colors: Record<Rating, string> = {
      good: '#4caf50',
      'needs-improvement': '#ff9800',
      poor: '#f44336',
      pending: '#9e9e9e',
    }
    return {
      color: colors[rating],
      fontWeight: 600,
      fontSize: '12px',
    }
  }

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>指标采集历史（最新在前）</h3>
      <div style={listStyle}>
        <div style={{ ...rowStyle('good'), fontWeight: 700, color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>
          <div>序号</div>
          <div>指标</div>
          <div>数值</div>
          <div>评级</div>
          <div>时间</div>
        </div>
        {reversed.map((record, idx) => {
          const d = new Date(record.timestamp)
          const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
          return (
            <div key={`${record.timestamp}-${idx}`} style={rowStyle(record.rating)}>
              <div style={{ color: '#999' }}>#{history.length - idx}</div>
              <div>
                <span style={tagStyle(record.name)}>{record.name}</span>
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums', color: '#333' }}>
                {record.value.toFixed(record.name === 'CLS' ? 3 : 0)}
              </div>
              <div style={ratingTag(record.rating)}>{ratingLabel[record.rating]}</div>
              <div style={{ color: '#999' }}>{time}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
