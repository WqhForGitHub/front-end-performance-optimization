import { useState } from 'react'
import type { ChangeEvent } from 'react'

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('张三')
  const [bio, setBio] = useState('前端工程师，关注性能与体验。')

  return (
    <div className="page">
      <h2>
        Profile 个人中心 <span className="tag tag-load">lazy chunk</span>
      </h2>
      <p>
        Profile 携带用户隐私相关逻辑，拆分成独立 chunk 还能带来安全收益：
        未登录用户根本不会下载这部分代码，减少攻击面。
      </p>

      <div className="diagram">
        <div className="diagram-title">路由级拆分的加载时序</div>
        <div
          style={{
            fontFamily: 'Fira Code, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.8,
            color: '#334155',
          }}
        >
          <div>t=0ms 请求 index.html</div>
          <div>t=20ms 解析 main.js（含 App + 路由表，但不含页面实现）</div>
          <div>t=35ms 请求 vendor.js（react / react-dom）</div>
          <div>
            t=60ms 请求 Home.js（首屏路由）=&gt;{' '}
            <span style={{ color: '#10b981' }}>可渲染首屏</span>
          </div>
          <div style={{ color: '#94a3b8' }}>--- 用户点击 Profile ---</div>
          <div>t=4200ms 请求 Profile.js（仅此刻才下载）</div>
          <div>t=4250ms Suspense 显示 fallback</div>
          <div>t=4310ms Profile.js 就绪，渲染个人中心</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', margin: '16px 0' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{name}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{bio}</div>
        </div>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
          <input
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="昵称"
          />
          <textarea
            value={bio}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
            placeholder="个人简介"
            rows={3}
            style={{
              padding: 8,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="nav-btn active" onClick={() => setEditing(false)}>
              保存
            </button>
            <button className="nav-btn" onClick={() => setEditing(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="nav-btn" onClick={() => setEditing(true)}>
          编辑资料
        </button>
      )}

      <div className="note">
        原则：按业务边界拆分。Profile 与首页、Dashboard 属于不同业务模块，
        拆开后既能减少首屏体积，也便于团队按模块并行开发与部署。
      </div>
    </div>
  )
}
