import { CSSProperties } from 'react'
import type { MetricData, Rating } from '../hooks/useWebVitals'

interface MetricCardProps {
  metric: MetricData
  description: string
}

const ratingColors: Record<Rating, { bg: string; border: string; text: string; label: string }> = {
  good: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', label: '良好' },
  'needs-improvement': { bg: '#fff8e1', border: '#ff9800', text: '#ef6c00', label: '需改进' },
  poor: { bg: '#ffebee', border: '#f44336', text: '#c62828', label: '较差' },
  pending: { bg: '#f5f5f5', border: '#bdbdbd', text: '#757575', label: '采集中' },
}

export default function MetricCard({ metric, description }: MetricCardProps) {
  const color = ratingColors[metric.rating]

  const cardStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    border: `2px solid ${color.border}33`,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'all 0.3s',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  }

  const nameStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#333',
    margin: 0,
  }

  const badgeStyle: CSSProperties = {
    backgroundColor: color.bg,
    color: color.text,
    border: `1px solid ${color.border}`,
    borderRadius: '12px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 600,
  }

  const valueStyle: CSSProperties = {
    fontSize: '36px',
    fontWeight: 700,
    color: color.text,
    margin: '4px 0',
    fontVariantNumeric: 'tabular-nums',
  }

  const unitStyle: CSSProperties = {
    fontSize: '16px',
    color: '#999',
    marginLeft: '4px',
    fontWeight: 400,
  }

  const descStyle: CSSProperties = {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    margin: '8px 0 0 0',
  }

  const valueText =
    metric.rating === 'pending'
      ? '--'
      : metric.value < 100
        ? metric.value.toFixed(3)
        : metric.value.toFixed(0)

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={nameStyle}>{metric.name}</h3>
        <span style={badgeStyle}>{color.label}</span>
      </div>
      <div>
        <span style={valueStyle}>{valueText}</span>
        {metric.unit && <span style={unitStyle}>{metric.unit}</span>}
      </div>
      <p style={descStyle}>{description}</p>
    </div>
  )
}
