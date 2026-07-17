import { CSSProperties } from 'react'

interface InjectedLinksPanelProps {
  injectedLinks: Array<{ rel: string; html: string; time: string }>
}

/**
 * 展示已注入到 document.head 的 link 标签列表
 */
export default function InjectedLinksPanel({ injectedLinks }: InjectedLinksPanelProps) {
  const wrapperStyle: CSSProperties = {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    fontFamily: 'Consolas, Monaco, monospace',
  }

  const titleStyle: CSSProperties = {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#81c784',
    fontFamily: 'system-ui, sans-serif',
  }

  const emptyStyle: CSSProperties = {
    color: '#666',
    fontSize: '13px',
    textAlign: 'center',
    padding: '16px',
  }

  const itemStyle: CSSProperties = {
    padding: '8px 10px',
    borderBottom: '1px solid #333',
    fontSize: '12px',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }

  const tagStyle: CSSProperties = {
    color: '#ffb74d',
    fontSize: '11px',
  }

  const codeStyle: CSSProperties = {
    color: '#90caf9',
    wordBreak: 'break-all',
  }

  return (
    <div style={wrapperStyle}>
      <h4 style={titleStyle}>document.head 中已注入的 link 标签（{injectedLinks.length}）</h4>
      {injectedLinks.length === 0 ? (
        <div style={emptyStyle}>
          暂无。点击上方卡片中的「注入到 &lt;head&gt;」按钮，对应 link 标签会被真实插入页面。
        </div>
      ) : (
        injectedLinks.map((link, idx) => (
          <div key={idx} style={itemStyle}>
            <span style={tagStyle}>[{link.time}] rel="{link.rel}"</span>
            <span style={codeStyle}>{link.html}</span>
          </div>
        ))
      )}
    </div>
  )
}
