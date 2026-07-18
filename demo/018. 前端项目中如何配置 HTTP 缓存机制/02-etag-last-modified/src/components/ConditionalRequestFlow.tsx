import { useState } from 'react'
import { negotiationFlow, modifiedFlow, type FlowStep } from '../data/cacheData'

function StepCard({ step }: { step: FlowStep }) {
  const isClient = step.side === 'client'
  return (
    <div className={`flow-step ${step.side} ${step.highlight ? 'highlight' : ''}`}>
      <div className="step-head">
        <span className={`side-tag ${step.side}`}>{isClient ? '浏览器' : '服务器'}</span>
        {step.status ? <span className={`status-pill s${step.status}`}>{step.status}</span> : null}
      </div>
      <div className="step-title">{step.title}</div>
      <div className="step-detail muted">{step.detail}</div>
      {step.payload ? <pre className="step-payload">{step.payload}</pre> : null}
    </div>
  )
}

export default function ConditionalRequestFlow() {
  const [mode, setMode] = useState<'hit' | 'modified'>('hit')
  const flow = mode === 'hit' ? negotiationFlow : modifiedFlow

  return (
    <section className="card">
      <div className="card-head">
        <h2>协商请求交互流程</h2>
        <p>
          左侧为浏览器，右侧为服务器。首次请求拿到校验器后，后续请求会带上
          <code className="inline-code">If-None-Match</code> /{' '}
          <code className="inline-code">If-Modified-Since</code>， 服务器比对后决定返回 304 还是
          200。
        </p>
      </div>

      <div className="mode-bar">
        <button
          className="chip"
          style={
            mode === 'hit' ? { background: '#16a34a', color: '#fff', borderColor: '#16a34a' } : {}
          }
          onClick={() => setMode('hit')}
        >
          场景 A：未变更 → 304
        </button>
        <button
          className="chip"
          style={
            mode === 'modified'
              ? { background: '#dc2626', color: '#fff', borderColor: '#dc2626' }
              : {}
          }
          onClick={() => setMode('modified')}
        >
          场景 B：已变更 {'->'} 200
        </button>
      </div>

      <div className="lane-head">
        <div className="lane lane-client">浏览器 / Client</div>
        <div className="lane lane-server">服务器 / Server</div>
      </div>

      <div className="flow-lanes">
        {flow.map((step, i) => (
          <div key={step.id} className="lane-row">
            <div className="lane-cell left">
              {step.side === 'client' ? <StepCard step={step} /> : null}
            </div>
            <div className="lane-arrow">
              <span className={i % 2 === 0 ? 'arrow-right' : 'arrow-left'}>
                {i % 2 === 0 ? '→' : '←'}
              </span>
            </div>
            <div className="lane-cell right">
              {step.side === 'server' ? <StepCard step={step} /> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flow-summary">
        {mode === 'hit' ? (
          <div>
            <strong>304 命中收益：</strong>省去了响应体传输。例如一个 200KB 的 JSON，304 响应只需约
            0.5KB 的头部，节省 99%+ 的带宽与下载时间。
          </div>
        ) : (
          <div>
            <strong>200 返回：</strong>服务器返回新内容并更新校验器。浏览器用新 ETag / Last-Modified
            覆盖本地缓存，下次再次进入协商流程。
          </div>
        )}
      </div>
    </section>
  )
}
