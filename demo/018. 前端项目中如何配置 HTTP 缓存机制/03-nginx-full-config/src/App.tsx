import ConfigDisplay from './components/ConfigDisplay'
import ResourceTypeTable from './components/ResourceTypeTable'
import DeploymentGuide from './components/DeploymentGuide'

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <span className="hero-badge">方案三</span>
          <h1>Nginx 完整 HTTP 缓存配置</h1>
          <p className="hero-sub">
            生产环境中 HTTP 缓存通常由 Nginx 统一管理。本方案给出一份可直接部署的
            <code className="hero-code">nginx.conf</code>，针对 HTML / JS / CSS / 图片 / 字体 / SW
            等不同资源分级设置缓存头。
          </p>
          <div className="hero-meta">
            <span className="meta-item">端口 5236</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">Nginx + Docker</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">分级缓存</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">SPA 回退</span>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="card overview">
          <div className="overview-head">
            <h2>整体架构</h2>
            <p>
              前端构建产物（带 hash）{'->'} Nginx 静态服务 {'->'} 按类型分发不同 Cache-Control。
            </p>
          </div>
          <div className="arch-flow">
            <div className="arch-node arch-build">
              <div className="arch-icon">B</div>
              <div>
                <div className="arch-title">Vite Build</div>
                <div className="arch-sub muted">产物带 contenthash</div>
              </div>
            </div>
            <div className="arch-arrow">{'->'}</div>
            <div className="arch-node arch-nginx">
              <div className="arch-icon">N</div>
              <div>
                <div className="arch-title">Nginx</div>
                <div className="arch-sub muted">按 location 分发缓存头</div>
              </div>
            </div>
            <div className="arch-arrow">{'->'}</div>
            <div className="arch-node arch-browser">
              <div className="arch-icon">U</div>
              <div>
                <div className="arch-title">浏览器 / CDN</div>
                <div className="arch-sub muted">强缓存 + 协商缓存</div>
              </div>
            </div>
          </div>
        </section>

        <ResourceTypeTable />

        <ConfigDisplay />

        <DeploymentGuide />

        <section className="card">
          <div className="card-head">
            <h2>配置要点与踩坑</h2>
            <p>实际部署中容易踩到的几个关键点。</p>
          </div>
          <div className="pitfall-grid">
            <div className="pitfall-item">
              <div className="pitfall-num">01</div>
              <h3>add_header 的继承陷阱</h3>
              <p className="muted">
                Nginx 中，若子 location 使用了 <code className="inline-code">add_header</code>，会
                <strong>覆盖</strong>而非合并父级的 add_header。 因此每个 location
                都需显式声明完整头部，或用 <code className="inline-code">include</code>{' '}
                公共片段。本配置已为每个 location 补全。
              </p>
            </div>
            <div className="pitfall-item">
              <div className="pitfall-num">02</div>
              <h3>HTML 必须是 no-cache</h3>
              <p className="muted">
                若 HTML 也设长缓存，用户在缓存期内拿不到引用新 hash JS 的
                HTML，发版后页面会加载旧的、可能已不存在的 JS 文件而白屏。
              </p>
            </div>
            <div className="pitfall-item">
              <div className="pitfall-num">03</div>
              <h3>immutable 的前提是 hash</h3>
              <p className="muted">
                只有文件名带 contenthash 才能用 immutable。若文件名固定（如{' '}
                <code className="inline-code">app.js</code>）， immutable 会导致用户永远拿不到更新。
              </p>
            </div>
            <div className="pitfall-item">
              <div className="pitfall-num">04</div>
              <h3>Service Worker 单独禁缓存</h3>
              <p className="muted">
                SW 文件本身被强缓存后，浏览器不会重新拉取，导致 SW 无法升级。必须{' '}
                <code className="inline-code">no-store</code>。
              </p>
            </div>
            <div className="pitfall-item">
              <div className="pitfall-num">05</div>
              <h3>gzip_vary 与缓存错乱</h3>
              <p className="muted">
                开启 gzip 后必须加 <code className="inline-code">Vary: Accept-Encoding</code>
                （gzip_vary on 自动加）， 否则 CDN 可能压缩版与未压缩版缓存串。
              </p>
            </div>
            <div className="pitfall-item">
              <div className="pitfall-num">06</div>
              <h3>分布式 ETag 一致性</h3>
              <p className="muted">
                多台 Nginx 各自生成 ETag（基于 mtime/size）可能不同，命中下降。必要时关闭 ETag 仅用
                Last-Modified，或前置 CDN 统一缓存。
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>完整 nginx.conf 文件位置</h2>
            <p>
              本方案的真实配置文件位于项目根目录 <code className="inline-code">nginx.conf</code>
              ，可直接用于部署。
            </p>
          </div>
          <pre className="code-block file-path">03-nginx-full-config/nginx.conf</pre>
          <div className="note-box">
            <strong>提示：</strong>若不使用 Docker，可把{' '}
            <code className="inline-code">nginx.conf</code> 内容放到
            <code className="inline-code">/etc/nginx/conf.d/default.conf</code>，并保证{' '}
            <code className="inline-code">root</code>
            指向构建产物目录。修改后执行 <code className="inline-code">nginx -s reload</code> 生效。
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>前端性能优化 · 018 · HTTP 缓存机制 · 方案三：Nginx 完整缓存配置</p>
      </footer>
    </div>
  )
}
