import type { FC } from 'react'

interface StrategyItem {
  name: string
  tag: string
  desc: string
  code: string
}

const strategies: StrategyItem[] = [
  {
    name: 'dns-prefetch',
    tag: '低优先级',
    desc: '提前对域名做 DNS 解析，开销极小，适合对未知/低频域名使用。',
    code: `<link rel="dns-prefetch" href="https://cdn.example.com" />`
  },
  {
    name: 'preconnect',
    tag: '关键域名',
    desc: '完成 DNS + TCP + TLS 握手，适合关键 API / CDN 域名，可节省 100-300ms。',
    code: `<link rel="preconnect" href="https://api.example.com" crossorigin />`
  },
  {
    name: 'preload',
    tag: '当前页必用',
    desc: '高优先级加载当前路由必须的关键资源（字体、首屏 CSS、关键 JS）。',
    code: `<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />`
  },
  {
    name: 'prefetch',
    tag: '下一页可能用',
    desc: '空闲时低优先级下载下一路由 chunk，命中缓存后切换近乎零耗时。',
    code: `<link rel="prefetch" href="/assets/dashboard-[hash].js" as="script" />`
  }
]

interface KpiItem {
  label: string
  value: string
  delta: string
  down: boolean
}

const kpis: KpiItem[] = [
  { label: 'FCP（无预连接）', value: '1.8s', delta: '基线', down: false },
  { label: 'FCP（preconnect）', value: '1.3s', delta: '-28%', down: true },
  { label: '路由切换（无预取）', value: '330ms', delta: '基线', down: false },
  { label: '路由切换（idle 预取）', value: '5ms', delta: '-98%', down: true }
]

export const RoutePrefetchList: FC = () => {
  return (
    <div className="section">
      <h2>2. 预连接与预取策略对比</h2>
      <div className="desc">
        在 <code>index.html</code> 头部声明 <code>dns-prefetch</code> / <code>preconnect</code> /
        <code> preload</code> / <code>prefetch</code>，分别用于不同场景的资源前置准备。
      </div>

      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="label">{k.label}</div>
            <div className="value">{k.value}</div>
            <div className={'delta ' + (k.down ? 'down' : 'up')}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="strategies" style={{ marginTop: 16 }}>
        {strategies.map((s) => (
          <div className="strategy-card" key={s.name}>
            <h4>
              {s.name}
              <span className="tag">{s.tag}</span>
            </h4>
            <pre>{s.code}</pre>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 6,
          fontSize: 12,
          color: '#92400e'
        }}
      >
        注意：preload 是「强制」高优先级，仅用于当前页必用资源；prefetch 是「建议」低优先级，
        浏览器在空闲时才下载。滥用 preload 反而会挤占首屏带宽。
      </div>
    </div>
  )
}
