import { useState, CSSProperties } from 'react'
import type { Technique } from '../data/techniques'

interface TechniqueCardProps {
  technique: Technique
  injected: boolean
  onInject: (rel: string) => void
}

/**
 * 单个优化技术卡片：
 * - 展示技术名称、用途、场景、示例 link 标签
 * - 点击「注入到 <head>」按钮会真实地把对应 link 标签插入到 document.head
 */
export default function TechniqueCard({ technique, injected, onInject }: TechniqueCardProps) {
  const [copied, setCopied] = useState(false)

  const cardStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    border: `2px solid ${technique.color}33`,
    borderRadius: '12px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  }

  const iconStyle: CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: `${technique.color}22`,
    color: technique.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '18px',
    flexShrink: 0,
  }

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: '#333',
  }

  const relTagStyle: CSSProperties = {
    fontSize: '12px',
    color: technique.color,
    fontFamily: 'monospace',
  }

  const sectionLabelStyle: CSSProperties = {
    fontSize: '11px',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 600,
    marginBottom: '4px',
  }

  const textStyle: CSSProperties = {
    fontSize: '13px',
    color: '#555',
    lineHeight: '1.6',
    margin: '0 0 12px 0',
  }

  const codeStyle: CSSProperties = {
    backgroundColor: '#1e1e1e',
    color: '#e0e0e0',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontFamily: 'Consolas, Monaco, monospace',
    overflowX: 'auto',
    margin: '0 0 12px 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  }

  const btnRowStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  }

  const btnBase: CSSProperties = {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid',
    transition: 'all 0.2s',
  }

  const injectBtnStyle: CSSProperties = injected
    ? {
        ...btnBase,
        backgroundColor: `${technique.color}22`,
        color: technique.color,
        borderColor: technique.color,
        cursor: 'default',
      }
    : { ...btnBase, backgroundColor: technique.color, color: '#fff', borderColor: technique.color }

  const copyBtnStyle: CSSProperties = {
    ...btnBase,
    backgroundColor: '#f5f5f5',
    color: '#666',
    borderColor: '#e0e0e0',
  }

  const handleCopy = () => {
    setCopied(true)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(technique.example).catch(() => {})
    }
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={iconStyle}>{technique.icon}</div>
        <div>
          <h3 style={titleStyle}>{technique.name}</h3>
          <div style={relTagStyle}>rel="{technique.rel}"</div>
        </div>
      </div>

      <div style={sectionLabelStyle}>用途</div>
      <p style={textStyle}>{technique.purpose}</p>

      <div style={sectionLabelStyle}>适用场景</div>
      <p style={textStyle}>{technique.scenario}</p>

      <div style={sectionLabelStyle}>示例</div>
      <pre style={codeStyle}>{technique.example}</pre>

      <div style={btnRowStyle}>
        <button style={injectBtnStyle} onClick={() => onInject(technique.rel)} disabled={injected}>
          {injected ? '已注入 <head>' : '注入到 <head>'}
        </button>
        <button style={copyBtnStyle} onClick={handleCopy}>
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  )
}
