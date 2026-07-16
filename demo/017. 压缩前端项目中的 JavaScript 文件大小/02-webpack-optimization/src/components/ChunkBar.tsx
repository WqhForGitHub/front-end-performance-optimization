import { CSSProperties } from 'react'
import type { ChunkInfo } from '../data/optimizationData'

interface ChunkBarProps {
  chunk: ChunkInfo
  /** 用于计算条形宽度的最大基准值 */
  max: number
}

/**
 * 单个 chunk 的体积条形：
 * - 左侧：chunk 名称 + 描述 + 首屏标记
 * - 右侧：体积条形 + 数值
 */
export function ChunkBar({ chunk, max }: ChunkBarProps) {
  const widthPct = (chunk.size / max) * 100

  const rowStyle: CSSProperties = {
    padding: '10px 12px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #eee',
  }

  const headerRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    flexWrap: 'wrap',
    gap: '8px',
  }

  const nameStyle: CSSProperties = {
    fontFamily: 'monospace',
    fontWeight: 600,
    color: '#333',
    fontSize: '13px',
  }

  const badgeStyle: CSSProperties = {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: chunk.firstLoad ? '#e3f2fd' : '#f5f5f5',
    color: chunk.firstLoad ? '#0d47a1' : '#888',
    fontWeight: 600,
  }

  const sizeStyle: CSSProperties = {
    fontWeight: 700,
    color: chunk.color,
    fontSize: '14px',
  }

  const descStyle: CSSProperties = {
    fontSize: '11px',
    color: '#999',
    marginBottom: '6px',
  }

  const barTrackStyle: CSSProperties = {
    width: '100%',
    height: '18px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
  }

  const barFillStyle: CSSProperties = {
    width: `${widthPct}%`,
    height: '100%',
    backgroundColor: chunk.color,
    transition: 'width 0.4s ease',
  }

  return (
    <div style={rowStyle}>
      <div style={headerRowStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={nameStyle}>{chunk.name}</span>
          <span style={badgeStyle}>{chunk.firstLoad ? '首屏必需' : '按需加载'}</span>
        </div>
        <span style={sizeStyle}>{chunk.size.toFixed(1)} KB</span>
      </div>
      <div style={descStyle}>{chunk.desc}</div>
      <div style={barTrackStyle}>
        <div style={barFillStyle} />
      </div>
    </div>
  )
}
