import { validators, headerPairs } from '../data/cacheData'

const typeLabel = { strong: '强校验', weak: '弱校验' }

export default function ValidatorComparison() {
  return (
    <section className="card">
      <div className="card-head">
        <h2>ETag vs Last-Modified 校验器对比</h2>
        <p>
          协商缓存的本质是“校验器比对”。HTTP 定义了两类校验器：<strong>强校验器 (ETag)</strong> 和
          <strong>弱校验器 (Last-Modified)</strong>。两者可以同时存在，但 ETag 优先级更高。
        </p>
      </div>

      <div className="validator-grid">
        {validators.map((v) => (
          <div key={v.header} className="validator-card" style={{ borderTopColor: v.color }}>
            <div className="vc-head" style={{ color: v.color }}>
              <span className="vc-type">{typeLabel[v.type]}</span>
              <h3>{v.header}</h3>
            </div>
            <div className="vc-pair">
              <div>
                <div className="vc-label">响应头</div>
                <code className="inline-code">{v.header}</code>
              </div>
              <div className="vc-arrow">→</div>
              <div>
                <div className="vc-label">请求头</div>
                <code className="inline-code">{v.requestHeader}</code>
              </div>
            </div>
            <dl className="vc-list">
              <div>
                <dt>精度依据</dt>
                <dd>{v.precision}</dd>
              </div>
              <div>
                <dt>最小粒度</dt>
                <dd>{v.granularity}</dd>
              </div>
              <div>
                <dt>优点</dt>
                <dd className="muted">{v.pros}</dd>
              </div>
              <div>
                <dt>缺点</dt>
                <dd className="muted">{v.cons}</dd>
              </div>
            </dl>
            <pre className="vc-example">{v.example}</pre>
          </div>
        ))}
      </div>

      <div className="header-pairs">
        <h3>响应头与请求头的对应关系</h3>
        <div className="pair-grid">
          {headerPairs.map((p) => (
            <div key={p.responseHeader} className="pair-row">
              <div className="pair-col">
                <span className="pair-tag resp">响应</span>
                <code className="inline-code">{p.responseHeader}</code>
              </div>
              <span className="pair-arrow">⇄</span>
              <div className="pair-col">
                <span className="pair-tag req">请求</span>
                <code className="inline-code">{p.requestHeader}</code>
              </div>
              <div className="pair-desc muted">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="note-box">
        <strong>优先级规则：</strong>当服务器同时收到{' '}
        <code className="inline-code">If-None-Match</code> 与
        <code className="inline-code">If-Modified-Since</code> 时，<strong>只校验 ETag</strong>。
        只有当请求不含 If-None-Match（或服务器不支持 ETag）时，才使用 Last-Modified。
      </div>
    </section>
  )
}
