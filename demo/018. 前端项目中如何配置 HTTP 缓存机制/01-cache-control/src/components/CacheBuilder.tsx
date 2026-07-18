import { useMemo, useState, type ChangeEvent } from 'react'
import { presets } from '../data/directives'

interface Toggle {
  key: string
  label: string
  desc: string
  hasValue?: boolean
  defaultValue?: string
}

const toggles: Toggle[] = [
  { key: 'public', label: 'public', desc: '允许共享缓存' },
  { key: 'private', label: 'private', desc: '仅浏览器缓存' },
  { key: 'no-cache', label: 'no-cache', desc: '每次协商校验' },
  { key: 'no-store', label: 'no-store', desc: '禁止缓存' },
  { key: 'max-age', label: 'max-age', desc: '存活秒数', hasValue: true, defaultValue: '3600' },
  { key: 's-maxage', label: 's-maxage', desc: 'CDN 存活秒数', hasValue: true, defaultValue: '600' },
  { key: 'immutable', label: 'immutable', desc: '永不变更' },
  { key: 'must-revalidate', label: 'must-revalidate', desc: '过期必校验' },
  { key: 'no-transform', label: 'no-transform', desc: '禁止转码' },
  {
    key: 'stale-while-revalidate',
    label: 'stale-while-revalidate',
    desc: '过期后台刷新',
    hasValue: true,
    defaultValue: '600',
  },
]

/** 根据当前勾选项模拟出最终的 Cache-Control 头 */
function buildHeader(state: Record<string, { on: boolean; value: string }>): string {
  const parts: string[] = []
  for (const t of toggles) {
    const s = state[t.key]
    if (!s || !s.on) continue
    if (t.hasValue) {
      parts.push(`${t.key}=${s.value || t.defaultValue}`)
    } else {
      parts.push(t.key)
    }
  }
  return parts.length ? parts.join(', ') : '(未设置任何指令)'
}

/** 简单语义校验，给出提示 */
function lint(
  state: Record<string, { on: boolean; value: string }>,
): { level: 'warn' | 'ok' | 'err'; msg: string }[] {
  const out: { level: 'warn' | 'ok' | 'err'; msg: string }[] = []
  const on = (k: string) => state[k]?.on
  if (on('no-store')) {
    out.push({ level: 'err', msg: 'no-store 已禁止缓存，其它指令将失去意义' })
    return out
  }
  if (on('public') && on('private')) {
    out.push({ level: 'warn', msg: 'public 与 private 互斥，建议只保留一个' })
  }
  if (on('no-cache') && on('max-age')) {
    out.push({ level: 'warn', msg: 'no-cache 会忽略 max-age 的强缓存效果' })
  }
  if (on('immutable') && !on('max-age')) {
    out.push({ level: 'warn', msg: 'immutable 通常配合较长的 max-age 使用' })
  }
  if (on('max-age') && on('s-maxage')) {
    out.push({ level: 'ok', msg: '同时设置浏览器与 CDN 缓存时间，分工合理' })
  }
  if (out.length === 0) {
    out.push({ level: 'ok', msg: '当前组合看起来合理' })
  }
  return out
}

export default function CacheBuilder() {
  const [state, setState] = useState<Record<string, { on: boolean; value: string }>>(() => {
    const init: Record<string, { on: boolean; value: string }> = {}
    for (const t of toggles) {
      init[t.key] = { on: t.key === 'public' || t.key === 'max-age', value: t.defaultValue || '' }
    }
    return init
  })

  const header = useMemo(() => buildHeader(state), [state])
  const checks = useMemo(() => lint(state), [state])

  const toggle = (k: string) => {
    setState((prev) => ({ ...prev, [k]: { ...prev[k], on: !prev[k].on } }))
  }
  const setValue = (k: string, v: string) => {
    setState((prev) => ({ ...prev, [k]: { ...prev[k], value: v } }))
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>交互式 Cache-Control 配置器</h2>
        <p>勾选下方指令，实时拼接出 Cache-Control 响应头，并给出语义提示。</p>
      </div>

      <div className="builder-grid">
        <div className="builder-toggles">
          {toggles.map((t) => {
            const s = state[t.key]
            return (
              <div key={t.key} className={`toggle-row ${s.on ? 'active' : ''}`}>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={s.on}
                    onChange={() => toggle(t.key)}
                    style={{ marginRight: 8 }}
                  />
                  <code
                    className="tag"
                    style={{
                      background: s.on ? '#1e293b' : '#e2e8f0',
                      color: s.on ? '#fff' : '#475569',
                    }}
                  >
                    {t.label}
                  </code>
                  <span className="muted" style={{ marginLeft: 8 }}>
                    {t.desc}
                  </span>
                </label>
                {t.hasValue && s.on ? (
                  <input
                    type="text"
                    className="num-input"
                    value={s.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(t.key, e.target.value)}
                    placeholder={t.defaultValue}
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="builder-output">
          <div className="output-label">生成的响应头</div>
          <pre className="code-block header-preview">
            <span className="hdr-key">Cache-Control:</span> {header}
          </pre>
          <div className="output-label" style={{ marginTop: 16 }}>
            语义检查
          </div>
          <ul className="lint-list">
            {checks.map((c, i) => (
              <li key={i} className={`lint lint-${c.level}`}>
                <span className="lint-icon">
                  {c.level === 'err' ? 'x' : c.level === 'warn' ? '!' : 'v'}
                </span>
                {c.msg}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="preset-section">
        <h3>常见资源推荐配置</h3>
        <div className="preset-grid">
          {presets.map((p) => (
            <div key={p.resource} className="preset-card" style={{ borderTopColor: p.color }}>
              <div className="preset-resource">{p.resource}</div>
              <code className="preset-cc">{p.cacheControl}</code>
              <div className="preset-reason muted">{p.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
