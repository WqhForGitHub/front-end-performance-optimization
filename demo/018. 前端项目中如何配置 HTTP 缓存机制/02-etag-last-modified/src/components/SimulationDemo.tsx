import { useMemo, useState } from 'react'

type ResourceState = 'empty' | 'fresh' | 'needs-revalidate'

interface LogEntry {
  step: number
  action: string
  status: number | '—'
  transferred: string
  note: string
  tone: 'hit' | 'miss' | 'revalidate'
}

const INITIAL_ETAG = '"v1"'
const MODIFIED_ETAG = '"v2"'

export default function SimulationDemo() {
  const [etag, setEtag] = useState<string>('') // 浏览器本地保存的 ETag
  const [serverEtag, setServerEtag] = useState<string>(INITIAL_ETAG)
  const [resourceState, setResourceState] = useState<ResourceState>('empty')
  const [log, setLog] = useState<LogEntry[]>([])
  const [step, setStep] = useState(0)

  const bodySize = '186 KB'

  const reset = () => {
    setEtag('')
    setServerEtag(INITIAL_ETAG)
    setResourceState('empty')
    setLog([])
    setStep(0)
  }

  const request = () => {
    const nextStep = step + 1
    setStep(nextStep)

    // 无本地缓存 -> 首次请求 200
    if (!etag) {
      setEtag(serverEtag)
      setResourceState('fresh')
      setLog((prev) => [
        ...prev,
        {
          step: nextStep,
          action: 'GET /dashboard.json (无本地缓存)',
          status: 200,
          transferred: bodySize,
          note: '首次请求，下载完整内容并存入 ETag=' + serverEtag,
          tone: 'miss',
        },
      ])
      return
    }

    // 有本地缓存：no-cache 场景总是协商
    setResourceState('needs-revalidate')
    if (etag === serverEtag) {
      // 命中 304
      setLog((prev) => [
        ...prev,
        {
          step: nextStep,
          action: 'GET /dashboard.json (If-None-Match: ' + etag + ')',
          status: 304,
          transferred: '0.5 KB',
          note: 'ETag 一致，复用本地副本',
          tone: 'revalidate',
        },
      ])
      setResourceState('fresh')
    } else {
      // 服务端已变更 -> 200
      const newEtag = serverEtag
      setEtag(newEtag)
      setResourceState('fresh')
      setLog((prev) => [
        ...prev,
        {
          step: nextStep,
          action: 'GET /dashboard.json (If-None-Match: ' + etag + ')',
          status: 200,
          transferred: bodySize,
          note: 'ETag 不一致，下载新内容并更新本地 ETag=' + newEtag,
          tone: 'miss',
        },
      ])
    }
  }

  const modify = () => {
    setServerEtag((prev) => (prev === INITIAL_ETAG ? MODIFIED_ETAG : INITIAL_ETAG))
    // 本地副本变得过期
    if (resourceState === 'fresh') setResourceState('needs-revalidate')
  }

  const stats = useMemo(() => {
    const total = log.length
    const hit304 = log.filter((l) => l.status === 304).length
    const full200 = log.filter((l) => l.status === 200).length
    const saved = hit304 * 185.5 // KB 节省
    return { total, hit304, full200, saved: saved.toFixed(1) }
  }, [log])

  const stateLabel: Record<ResourceState, { text: string; color: string }> = {
    empty: { text: '无缓存', color: '#94a3b8' },
    fresh: { text: '已缓存 (新鲜)', color: '#16a34a' },
    'needs-revalidate': { text: '已缓存 (待校验)', color: '#ea580c' },
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>304 协商缓存模拟器</h2>
        <p>
          模拟浏览器请求 <code className="inline-code">/dashboard.json</code>（响应头{' '}
          <code className="inline-code">Cache-Control: no-cache</code>，
          即每次必须协商）。点击“发送请求”观察 304 / 200，点击“修改资源”模拟服务器内容更新。
        </p>
      </div>

      <div className="sim-grid">
        <div className="sim-panel sim-state">
          <h3>当前状态</h3>
          <div className="state-row">
            <span className="state-key">本地 ETag</span>
            <code className="inline-code">{etag || '(空)'}</code>
          </div>
          <div className="state-row">
            <span className="state-key">服务器 ETag</span>
            <code className="inline-code">{serverEtag}</code>
          </div>
          <div className="state-row">
            <span className="state-key">本地副本</span>
            <span
              className="badge"
              style={{
                background: stateLabel[resourceState].color + '22',
                color: stateLabel[resourceState].color,
              }}
            >
              {stateLabel[resourceState].text}
            </span>
          </div>
          <div className="sim-actions">
            <button className="btn btn-primary" onClick={request}>
              发送请求
            </button>
            <button className="btn btn-warn" onClick={modify}>
              修改资源
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              重置
            </button>
          </div>
        </div>

        <div className="sim-panel sim-stats">
          <h3>统计</h3>
          <div className="stat-grid">
            <div className="stat-cell">
              <div className="stat-num">{stats.total}</div>
              <div className="stat-label">总请求</div>
            </div>
            <div className="stat-cell hit">
              <div className="stat-num">{stats.hit304}</div>
              <div className="stat-label">304 复用</div>
            </div>
            <div className="stat-cell miss">
              <div className="stat-num">{stats.full200}</div>
              <div className="stat-label">200 下载</div>
            </div>
            <div className="stat-cell save">
              <div className="stat-num">{stats.saved}</div>
              <div className="stat-label">节省 (KB)</div>
            </div>
          </div>
          <div className="stat-tip muted">
            响应体约 {bodySize}，304 仅头部约 0.5KB。每次 304 约节省 185KB 带宽。
          </div>
        </div>
      </div>

      <div className="sim-log">
        <h3>请求日志</h3>
        {log.length === 0 ? (
          <div className="empty-log muted">还没有请求记录，点击“发送请求”开始模拟。</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>动作</th>
                  <th style={{ width: '80px' }}>状态</th>
                  <th style={{ width: '110px' }}>传输量</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l.step} className={l.tone}>
                    <td>{l.step}</td>
                    <td>
                      <code className="inline-code">{l.action}</code>
                    </td>
                    <td>
                      <span className={`status-pill s${l.status}`}>{l.status}</span>
                    </td>
                    <td>{l.transferred}</td>
                    <td className="muted">{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
