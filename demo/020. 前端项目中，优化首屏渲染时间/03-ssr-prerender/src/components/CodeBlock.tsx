import { useState } from 'react'
import type { CSSProperties } from 'react'

interface CodeBlockProps {
  title: string
  code: string
  lang?: string
}

const wrapperStyle: CSSProperties = {
  background: '#0a0c10',
  border: '1px solid var(--border)',
  borderRadius: 10,
  marginBottom: 14,
  overflow: 'hidden',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 14px',
  background: 'rgba(255,255,255,0.03)',
  borderBottom: '1px solid var(--border)',
  fontSize: 12,
  color: 'var(--muted)',
}

const preStyle: CSSProperties = {
  margin: 0,
  padding: 14,
  fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  fontSize: 12,
  lineHeight: 1.6,
  color: '#d6deeb',
  overflowX: 'auto',
  whiteSpace: 'pre',
}

export function CodeBlock({ title, code, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <span>
          {title}
          {lang ? <span style={{ marginLeft: 8, opacity: 0.6 }}>[{lang}]</span> : null}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: copied ? 'var(--accent)' : 'var(--muted)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre style={preStyle}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
