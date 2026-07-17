import { useState, CSSProperties } from 'react'

interface CodeBlockProps {
  title?: string
  code: string
  language?: string
}

/**
 * CodeBlock
 * 带复制按钮的代码块组件，用于展示响应式图片的 HTML 写法。
 */
export function CodeBlock({ title, code, language = 'html' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    // 使用 navigator.clipboard 异步复制
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(() => {
        // 降级：使用临时 textarea
        fallbackCopy(code)
        done()
      })
    } else {
      fallbackCopy(code)
      done()
    }
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  return (
    <div className="code-block">
      <div className="code-block-header" style={headerStyle}>
        <span className="code-block-title">{title || language}</span>
        <button type="button" className="copy-btn" onClick={handleCopy}>
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
  } catch (e) {
    // 忽略复制失败
  }
  document.body.removeChild(textarea)
}
