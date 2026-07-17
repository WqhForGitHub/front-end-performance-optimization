import { useState } from 'react'
import type { ReactNode, ChangeEvent } from 'react'

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const [notify, setNotify] = useState(true)
  const [autoSave, setAutoSave] = useState(false)

  return (
    <div className="page">
      <h2>Settings 设置 <span className="tag tag-load">lazy chunk</span></h2>
      <p>
        设置页使用频率低，是典型的「低优先级」路由。即使体积不大，也值得拆分出去，
        以保证高频路径（首页、Dashboard）的加载速度。
      </p>

      <div className="diagram">
        <div className="diagram-title">访问频率与拆分收益矩阵</div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 8, fontSize: 13 }}>
          <div></div>
          <div style={{ fontWeight: 600, color: '#10b981' }}>高频访问</div>
          <div style={{ fontWeight: 600, color: '#f59e0b' }}>低频访问</div>

          <div style={{ fontWeight: 600, color: '#ef4444' }}>大体积</div>
          <div style={{ color: '#475569' }}>必须拆分 + 预加载<br /><small>如带图表的 Dashboard</small></div>
          <div style={{ color: '#475569' }}>必须拆分、按需加载<br /><small>如 Settings（当前页）</small></div>

          <div style={{ fontWeight: 600, color: '#3b82f6' }}>小体积</div>
          <div style={{ color: '#475569' }}>可合入首屏 bundle<br /><small>如导航条</small></div>
          <div style={{ color: '#475569' }}>可拆可不拆<br /><small>视总体积而定</small></div>
        </div>
      </div>

      <h3>偏好设置</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440 }}>
        <Row label="主题">
          <select value={theme} onChange={(e: ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value as 'light' | 'dark')}>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </Row>
        <Row label="语言">
          <select value={lang} onChange={(e: ChangeEvent<HTMLSelectElement>) => setLang(e.target.value as 'zh' | 'en')}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </Row>
        <Row label="消息通知">
          <input type="checkbox" checked={notify} onChange={(e: ChangeEvent<HTMLInputElement>) => setNotify(e.target.checked)} />
        </Row>
        <Row label="自动保存">
          <input type="checkbox" checked={autoSave} onChange={(e: ChangeEvent<HTMLInputElement>) => setAutoSave(e.target.checked)} />
        </Row>
      </div>

      <div className="note">
        原则：按访问频率决定优先级。Settings 这类低频页面不应拖累高频页面的首屏速度，
        拆分出去即使只省下 10KB，对首屏也有正向收益。
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
      <span style={{ color: '#374151' }}>{label}</span>
      <span>{children}</span>
    </div>
  )
}
