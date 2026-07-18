import { resourcePolicies } from '../data/nginxData'

export default function ResourceTypeTable() {
  return (
    <section className="card">
      <div className="card-head">
        <h2>按资源类型分级缓存策略</h2>
        <p>
          真实前端项目包含多种资源类型，它们的“变更频率”与“更新方式”不同，缓存策略也应分级。 下表是
          nginx.conf 中各 location 对应的推荐配置。
        </p>
      </div>

      <div className="policy-cards">
        {resourcePolicies.map((p) => (
          <div key={p.type} className="policy-card" style={{ borderTopColor: p.color }}>
            <div className="pc-head">
              <span className="pc-icon" style={{ background: p.color }}>
                {p.icon}
              </span>
              <div>
                <div className="pc-type">{p.type}</div>
                <code className="pc-pattern">{p.pattern}</code>
              </div>
            </div>
            <div className="pc-cc">
              <span className="pc-label">Cache-Control</span>
              <code className="pc-value">{p.cacheControl}</code>
            </div>
            <div className="pc-meta">
              <div>
                <span className="pc-label">有效期</span>
                <span className="pc-ttl">{p.ttl}</span>
              </div>
            </div>
            <p className="pc-reason muted">{p.reason}</p>
          </div>
        ))}
      </div>

      <div className="note-box">
        <strong>核心原则：</strong>“文件名是否随内容变化” 决定能否长缓存。 带 contenthash
        的产物（JS/CSS）可 <code className="inline-code">immutable</code> 永久缓存； 不带 hash
        且需要实时性的资源（HTML、SW、manifest）必须 <code className="inline-code">no-cache</code>。
      </div>
    </section>
  )
}
