import ValidatorComparison from './components/ValidatorComparison'
import ConditionalRequestFlow from './components/ConditionalRequestFlow'
import SimulationDemo from './components/SimulationDemo'

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <span className="hero-badge">方案二</span>
          <h1>ETag / Last-Modified 协商缓存</h1>
          <p className="hero-sub">
            当强缓存过期或被 <code className="hero-code">no-cache</code>{' '}
            标记时，浏览器进入协商缓存阶段： 携带校验器向服务器确认资源是否变更，未变则返回 304
            复用本地副本。
          </p>
          <div className="hero-meta">
            <span className="meta-item">端口 5235</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">If-None-Match</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">If-Modified-Since</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">304 Not Modified</span>
          </div>
        </div>
      </header>

      <main className="container">
        <ValidatorComparison />
        <ConditionalRequestFlow />
        <SimulationDemo />

        <section className="card">
          <div className="card-head">
            <h2>协商缓存触发的两种情况</h2>
            <p>资源何时会进入协商流程？取决于响应头如何设置。</p>
          </div>
          <div className="trigger-grid">
            <div className="trigger-card">
              <div className="trigger-tag t1">情况一</div>
              <h3>no-cache 标记</h3>
              <p className="muted">
                响应头 <code className="inline-code">Cache-Control: no-cache</code>{' '}
                表示“可以存，但每次用前必须校验”。 浏览器每次都会发协商请求，命中则 304。适合 HTML
                入口或频繁可能更新的 API。
              </p>
            </div>
            <div className="trigger-card">
              <div className="trigger-tag t2">情况二</div>
              <h3>max-age 过期</h3>
              <p className="muted">
                响应头 <code className="inline-code">Cache-Control: max-age=60</code>，60
                秒内走强缓存， 60
                秒后过期，下次请求自动带上校验器进入协商。适合更新频率可预估的静态资源。
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>强缓存 vs 协商缓存 对照</h2>
            <p>理解两者差异是配置 HTTP 缓存的关键。</p>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>维度</th>
                  <th>强缓存</th>
                  <th>协商缓存</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>触发指令</td>
                  <td>max-age / Expires</td>
                  <td>no-cache / max-age 过期</td>
                </tr>
                <tr>
                  <td>是否发请求</td>
                  <td>否（0 次网络请求）</td>
                  <td>是（1 次请求）</td>
                </tr>
                <tr>
                  <td>状态码</td>
                  <td>200 (from cache)</td>
                  <td>304 / 200</td>
                </tr>
                <tr>
                  <td>传输内容</td>
                  <td>无</td>
                  <td>304: 仅头部 / 200: 完整内容</td>
                </tr>
                <tr>
                  <td>关键头</td>
                  <td>Cache-Control, Expires</td>
                  <td>ETag, Last-Modified, If-None-Match, If-Modified-Since</td>
                </tr>
                <tr>
                  <td>适用资源</td>
                  <td>带 hash 的 JS/CSS、字体</td>
                  <td>HTML 文档、API 数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>实战提示</h2>
          </div>
          <div className="tip-list">
            <div className="tip-item">
              <span className="tip-num">1</span>
              <div>
                <strong>不要给带 hash 的产物用 no-cache。</strong>
                hash 变了就是新文件，应直接{' '}
                <code className="inline-code">max-age=31536000, immutable</code>{' '}
                走强缓存，避免不必要的协商。
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-num">2</span>
              <div>
                <strong>HTML 入口用 no-cache。</strong>
                保证用户总能拿到引用了最新 JS/CSS 文件名的 HTML，否则强缓存的旧 HTML
                会指向已失效的旧 hash 文件。
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-num">3</span>
              <div>
                <strong>ETag 优先于 Last-Modified。</strong>
                Nginx 默认两者都会发送，浏览器会同时带上两个请求头，但服务器只校验 If-None-Match。
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-num">4</span>
              <div>
                <strong>分布式部署注意 ETag 一致性。</strong>
                若多台机器各自计算 ETag（基于 mtime/size），同一资源可能 ETag
                不同导致命中率下降，建议用内容 hash 或关闭 ETag 仅用 Last-Modified。
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>前端性能优化 · 018 · HTTP 缓存机制 · 方案二：ETag / Last-Modified 协商缓存</p>
      </footer>
    </div>
  )
}
