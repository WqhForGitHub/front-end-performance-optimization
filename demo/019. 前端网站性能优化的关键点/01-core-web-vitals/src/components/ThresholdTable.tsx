import { CSSProperties } from 'react'
import type { Rating } from '../hooks/useWebVitals'

interface ThresholdRow {
  name: string
  fullName: string
  goodMax: string
  needsMax: string
  unit: string
  description: string
}

const thresholds: ThresholdRow[] = [
  {
    name: 'LCP',
    fullName: 'Largest Contentful Paint（最大内容绘制）',
    goodMax: '≤ 2.5s',
    needsMax: '≤ 4.0s',
    unit: 'ms',
    description: '测量页面主要内容完成渲染的时间',
  },
  {
    name: 'CLS',
    fullName: 'Cumulative Layout Shift（累计布局偏移）',
    goodMax: '≤ 0.1',
    needsMax: '≤ 0.25',
    unit: '分数',
    description: '测量页面生命周期中累计的布局偏移量',
  },
  {
    name: 'INP',
    fullName: 'Interaction to Next Paint（交互到下一次绘制）',
    goodMax: '≤ 200ms',
    needsMax: '≤ 500ms',
    unit: 'ms',
    description: '测量页面响应交互的速度（取代 FID）',
  },
]

const ratingCellStyle = (rating: Rating): CSSProperties => {
  const colors: Record<Rating, string> = {
    good: '#4caf50',
    'needs-improvement': '#ff9800',
    poor: '#f44336',
    pending: '#9e9e9e',
  }
  return {
    padding: '8px 12px',
    color: colors[rating],
    fontWeight: 600,
    backgroundColor: `${colors[rating]}11`,
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '13px',
  }
}

interface ThresholdTableProps {
  currentRatings: Record<'LCP' | 'CLS' | 'INP', Rating>
}

export default function ThresholdTable({ currentRatings }: ThresholdTableProps) {
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

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  }

  const thStyle: CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    color: '#555',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const tdStyle: CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
    verticalAlign: 'top',
  }

  const nameTdStyle: CSSProperties = {
    ...tdStyle,
    fontWeight: 700,
    color: '#1976d2',
  }

  const legendStyle: CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    fontSize: '12px',
    color: '#666',
  }

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>Core Web Vitals 评级阈值标准（Google 官方）</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>指标</th>
            <th style={thStyle}>全称</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>良好</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>需改进</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>较差</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>当前评级</th>
          </tr>
        </thead>
        <tbody>
          {thresholds.map((row) => {
            const rating = currentRatings[row.name as 'LCP' | 'CLS' | 'INP']
            return (
              <tr key={row.name}>
                <td style={nameTdStyle}>{row.name}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{row.fullName}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{row.description}</div>
                </td>
                <td style={{ ...ratingCellStyle('good'), textAlign: 'center' }}>{row.goodMax}</td>
                <td style={{ ...ratingCellStyle('needs-improvement'), textAlign: 'center' }}>
                  {row.needsMax}
                </td>
                <td style={{ ...ratingCellStyle('poor'), textAlign: 'center' }}>
                  {'> ' + row.needsMax.replace('≤ ', '')}
                </td>
                <td style={ratingCellStyle(rating)}>
                  {rating === 'pending'
                    ? '采集中'
                    : rating === 'good'
                      ? '良好'
                      : rating === 'needs-improvement'
                        ? '需改进'
                        : '较差'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div style={legendStyle}>
        <span>
          说明：良好阈值是 75% 的页面加载应达到的目标；FID 已被 INP 取代（2024 年 3 月起）。
        </span>
      </div>
    </div>
  )
}
