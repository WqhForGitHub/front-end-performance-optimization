import { useState, type ReactNode } from 'react'
import { configSections, nginxConfSource } from '../data/nginxData'

/** 简单的 nginx 配置高亮：按关键字着色 */
function highlight(line: string): ReactNode {
  const keywords = [
    { re: /(#.*$)/, color: '#64748b' },
    { re: /\b(server|location|listen|root|index|return|try_files|add_header|gzip|error_page|etag)\b/g, color: '#c084fc' },
    { re: /\b(public|private|no-cache|no-store|must-revalidate|immutable|max-age|s-maxage)\b/g, color: '#7dd3fc' },
    { re: /("[^"]*")/g, color: '#86efac' },
    { re: /(\$\w+)/g, color: '#fbbf24' },
    { re: /\b(\d+)\b/g, color: '#fda4af' }
  ]

  // 先处理注释整行
  const commentMatch = line.match(/^(\s*)(#.*)$/)
  if (commentMatch) {
    return [
      commentMatch[1],
      <span key="c" style={{ color: '#64748b', fontStyle: 'italic' }}>{commentMatch[2]}</span>
    ]
  }

  // 用占位符分词高亮，避免重叠替换
  let parts: { text: string; color?: string }[] = [{ text: line }]
  for (const k of keywords.slice(1)) {
    const next: { text: string; color?: string }[] = []
    for (const part of parts) {
      if (part.color) {
        next.push(part)
        continue
      }
      let lastIndex = 0
      k.re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = k.re.exec(part.text)) !== null) {
        if (m.index > lastIndex) {
          next.push({ text: part.text.slice(lastIndex, m.index) })
        }
        next.push({ text: m[0], color: k.color })
        lastIndex = m.index + m[0].length
        if (m[0] === '') k.re.lastIndex++
      }
      if (lastIndex < part.text.length) {
        next.push({ text: part.text.slice(lastIndex) })
      }
    }
    parts = next
  }

  return parts.map((p, i) => (p.color ? <span key={i} style={{ color: p.color }}>{p.text}</span> : <span key={i}>{p.text}</span>))
}

export default function ConfigDisplay() {
  const [active, setActive] = useState(configSections[0].id)
  const lines = nginxConfSource.split('\n')

  return (
    <section className="card">
      <div className="card-head">
        <h2>nginx.conf 完整配置</h2>
        <p>
          这是项目根目录 <code className="inline-code">nginx.conf</code> 的内容，可直接用于生产部署。
          点击下方分段按钮，查看对应区块的说明。
        </p>
      </div>

      <div className="section-tabs">
        {configSections.map((s) => (
          <button
            key={s.id}
            className="section-tab"
            style={active === s.id ? { background: '#1e293b', color: '#fff', borderColor: '#1e293b' } : {}}
            onClick={() => setActive(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="config-layout">
        <div className="config-code">
          <div className="code-head">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="code-title">nginx.conf</span>
          </div>
          <pre className="code-body">
            {lines.map((line, i) => (
              <div key={i} className="code-line">
                <span className="line-no">{i + 1}</span>
                <span className="line-content">{highlight(line)}</span>
              </div>
            ))}
          </pre>
        </div>

        <div className="config-explain">
          {configSections.filter((s) => s.id === active).map((s) => (
            <div key={s.id}>
              <div className="explain-head">
                <span className="explain-range">{s.lineRange}</span>
                <h3>{s.title}</h3>
              </div>
              <p className="muted explain-desc">{s.desc}</p>
              <div className="directive-list">
                {s.directives.map((d) => (
                  <div key={d.name} className="directive-row">
                    <code className="inline-code">{d.name}</code>
                    <span className="muted">{d.explain}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
