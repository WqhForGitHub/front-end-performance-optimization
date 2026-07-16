import { CSSProperties } from 'react'
import type { CompressionEntry } from '../data/compressionData'

interface CompressionBarProps {
  entry: CompressionEntry
  max: number
}

/**
 * 单个资源的 4 状态体积对比条形图：
 * - original  (红)  : 原始未压缩
 * - minified  (橙)  : Terser 压缩后
 * - gzipped   (蓝)  : gzip 压缩后
 * - brotli    (绿)  : brotli 压缩后
 */
export function CompressionBar({ entry, max }: CompressionBarProps) {
  const isTotal = entry.name === 'Total'
  const originalPct = (entry.original / max) * 100
  const minifiedPct = (entry.minified / max) * 100
  const gzippedPct = (entry.gzipped / max) * 100
  const brotliPct = (entry.brotli / max) * 100

  const rowStyle: CSSProperties = {
    padding: '12px',
    backgroundColor: isTotal ? '#f5f5f5' : '#fff',
    borderRadius: '8px',
    marginBottom: '10px',
    border: isTotal ? '2px solid #388e3c' : '1px solid #eee',
  }

  const headerRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  }

  const nameStyle: CSSProperties = {
    fontWeight: isTotal ? 700 : 600,
    fontFamily: isTotal ? 'system-ui' : 'monospace',
    color: '#333',
    fontSize: '14px',
  }

  const descStyle: CSSProperties = {
    fontSize: '11px',
    color: '#999',
    marginBottom: '8px',
  }

  const barRowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 70px',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '4px',
  }

  const labelStyle = (color: string): CSSProperties => ({
    fontSize: '11px',
    color,
    fontWeight: 600,
    textAlign: 'right',
  })

  const barTrackStyle: CSSProperties = {
    height: '16px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    overflow: 'hidden',
  }

  const sizeStyle: CSSProperties = {
    fontSize: '11px',
    color: '#555',
    fontFamily: 'monospace',
  }

  const bar = (pct: number, color: string): CSSProperties => ({
    width: `${pct}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.4s ease',
  })

  return (
    <div style={rowStyle}>
      <div style={headerRowStyle}>
        <span style={nameStyle}>{entry.name}</span>
        <span style={{ fontSize: '11px', color: '#388e3c', fontWeight: 700 }}>
          brotli 节省 {(((entry.original - entry.brotli) / entry.original) * 100).toFixed(1)}%
        </span>
      </div>
      {!isTotal && <div style={descStyle}>{entry.desc}</div>}

      <div style={barRowStyle}>
        <span style={labelStyle('#ef5350')}>原始</span>
        <div style={barTrackStyle}>
          <div style={bar(originalPct, '#ef5350')} />
        </div>
        <span style={sizeStyle}>{entry.original.toFixed(1)} KB</span>
      </div>

      <div style={barRowStyle}>
        <span style={labelStyle('#ff7043')}>压缩</span>
        <div style={barTrackStyle}>
          <div style={bar(minifiedPct, '#ff7043')} />
        </div>
        <span style={sizeStyle}>{entry.minified.toFixed(1)} KB</span>
      </div>

      <div style={barRowStyle}>
        <span style={labelStyle('#1976d2')}>gzip</span>
        <div style={barTrackStyle}>
          <div style={bar(gzippedPct, '#1976d2')} />
        </div>
        <span style={sizeStyle}>{entry.gzipped.toFixed(1)} KB</span>
      </div>

      <div style={barRowStyle}>
        <span style={labelStyle('#388e3c')}>brotli</span>
        <div style={barTrackStyle}>
          <div style={bar(brotliPct, '#388e3c')} />
        </div>
        <span style={sizeStyle}>{entry.brotli.toFixed(1)} KB</span>
      </div>
    </div>
  )
}
