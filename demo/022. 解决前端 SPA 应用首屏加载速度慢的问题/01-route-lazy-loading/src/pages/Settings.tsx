import { useState, type FC, type ChangeEvent } from 'react'

interface SettingItem {
  key: string
  label: string
  value: boolean
  desc: string
}

export const Settings: FC = () => {
  const [items, setItems] = useState<SettingItem[]>([
    { key: 'notify', label: '消息推送', value: true, desc: '接收系统通知与提醒' },
    { key: 'sound', label: '声音提示', value: false, desc: '新消息时播放提示音' },
    { key: 'analytics', label: '匿名埋点', value: true, desc: '帮助改进产品体验' },
    { key: 'beta', label: 'Beta 功能', value: false, desc: '抢先体验实验性功能' }
  ])
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')

  const toggle = (key: string): void => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, value: !it.value } : it)))
  }

  return (
    <div>
      <h2>设置 Settings</h2>
      <p>该页面同样通过 <code>React.lazy</code> 异步加载，包含本地表单状态。</p>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>主题</div>
        <select
          value={theme}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value as typeof theme)}
          style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
        >
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it) => (
          <div
            key={it.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{it.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(it.key)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: it.value ? '#22c55e' : '#d1d5db',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative',
                fontSize: 10,
                transition: 'background 0.15s ease'
              }}
            >
              {it.value ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Settings
