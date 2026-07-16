import { CSSProperties } from 'react'
import type { SizeEntry } from '../data/sizeData'

interface SizeBarProps {
  entry: SizeEntry
}

/**
 * 单条体积对比条形图：
 * - 左侧：资源名 + 描述
 * - 右侧：双条形对比（原始 vs 压缩后）
 *   - 原始条形按比例占满最大宽度
 *   - 压缩后条形按比例缩短，颜色不同
 */
export function SizeBar({ entry }: SizeBarProps) {
  // 用最大的原始值作为 100% 基准
  const maxOriginal = 829.1
  const originalWidthPct = (entry.original / maxOriginal) * 100
  const minifiedWidthPct = (entry.minified / maxOriginal) * 100
  const savedPct = ((entry.original - entry.minified) / entry.original) * 100

  const isTotal = entry.name === 'Total'

  const rowStyle: CSSProperties = {
    padding: '10px 12px',
    backgroundColor: isTotal ? '#f5f5f5' : '#fff',
    borderRadius: '8px',
    marginBottom: '8px',
    border: isTotal ? '2px solid #1976d2' : '1px solid #eee',
  }

  const headerRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  }

  const nameStyle: CSSProperties = {
    fontWeight: isTotal ? 700 : 600,
    fontFamily: isTotal ? 'system-ui' : 'monospace',
    color: '#333',
    fontSize: '14px',
  }

  const savedStyle: CSSProperties = {
    color: '#2e7d32',
    fontSize: '12px',
    fontWeight: 700,
  }

  const barTrackStyle: CSSProperties = {
    width: '100%',
    height: '22px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '4px',
  }

  const originalBarStyle: CSSProperties = {
    width: `${originalWidthPct}%`,
    height: '100%',
    backgroundColor: isTotal ? '#ef5350' : '#ff7043',
    transition: 'width 0.4s ease',
  }

  const minifiedBarStyle: CSSProperties = {
    width: `${minifiedWidthPct}%`,
    height: '100%',
    backgroundColor: isTotal ? '#1565c0' : '#42a5f5',
    transition: 'width 0.4s ease',
  }

  const labelRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#666',
  }

  const descStyle: CSSProperties = {
    fontSize: '11px',
    color: '#999',
    marginBottom: '4px',
  }

  return (
    <div style={rowStyle}>
      <div style={headerRowStyle}>
        <span style={nameStyle}>{entry.name}</span>
        <span style={savedStyle}>节省 {savedPct.toFixed(1)}%</span>
      </div>
      {!isTotal && <div style={descStyle}>{entry.desc}</div>}
      <div style={barTrackStyle} title={`原始 ${entry.original} KB`}>
        <div style={originalBarStyle} />
      </div>
      <div style={labelRowStyle}>
        <span>原始: {entry.original.toFixed(1)} KB</span>
        <span style={{ color: '#1565c0' }}>压缩后: {entry.minified.toFixed(1)} KB</span>
      </div>
      <div style={{ ...barTrackStyle, marginTop: '4px' }} title={`压缩后 ${entry.minified} KB`}>
        <div style={minifiedBarStyle} />
      </div>
    </div>
  )
}
