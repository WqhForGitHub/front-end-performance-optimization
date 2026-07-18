import DirectiveTable from './components/DirectiveTable'
import CacheFlowDiagram from './components/CacheFlowDiagram'
import CacheBuilder from './components/CacheBuilder'

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <span className="hero-badge">方案一</span>
          <h1>Cache-Control 指令演示</h1>
          <p className="hero-sub">
            通过 Cache-Control 响应头精细控制浏览器与 CDN 的缓存行为。本演示展示各指令含义、
            浏览器缓存决策流程，并提供交互式配置器。
          </p>
          <div className="hero-meta">
            <span className="meta-item">端口 5234</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">强缓存</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">协商缓存</span>
          </div>
        </div>
      </header>

      <main className="container">
        <DirectiveTable />

        <CacheFlowDiagram />

        <CacheBuilder />

        <section className="card">
          <div className="card-head">
            <h2>HTTP 缓存两大阶段</h2>
            <p>一次资源请求会依次经过两个阶段：先判断“强缓存”，再判断“协商缓存”。</p>
          </div>
          <div className="stage-grid">
            <div className="stage-card stage-strong">
              <div className="stage-num">01</div>
              <h3>强缓存 (Freshness)</h3>
              <p className="muted">
                通过 <code className="inline-code">max-age</code> /{' '}
                <code className="inline-code">Expires</code> 判断本地副本是否过期。 未过期直接使用，
                <strong>不发任何网络请求</strong>，状态码 200，DevTools 显示
                <code className="inline-code">from disk cache</code> 或{' '}
                <code className="inline-code">from memory cache</code>。
              </p>
              <div className="stage-result">命中 → 0 次请求 · 0 字节传输</div>
            </div>
            <div className="stage-card stage-nego">
              <div className="stage-num">02</div>
              <h3>协商缓存 (Revalidation)</h3>
              <p className="muted">
                副本过期或标记 <code className="inline-code">no-cache</code> 时，携带
                <code className="inline-code">If-None-Match</code> /{' '}
                <code className="inline-code">If-Modified-Since</code>
                向服务器校验。未改返回 <strong>304</strong>，改了返回 <strong>200</strong>{' '}
                并下载新内容。
              </p>
              <div className="stage-result">命中 → 1 次请求 · 仅头部传输</div>
            </div>
          </div>

          <div className="note-box">
            <strong>关键区别：</strong>
            <ul>
              <li>
                <code className="inline-code">no-cache</code> = 总是协商（仍可能 304 复用），而{' '}
                <code className="inline-code">no-store</code> = 完全不存。
              </li>
              <li>
                <code className="inline-code">max-age=0, must-revalidate</code>{' '}
                等价于“每次都协商”，但允许 304。
              </li>
              <li>
                <code className="inline-code">immutable</code>{' '}
                让强缓存在用户主动刷新（F5）时也生效，适合带 hash 的产物。
              </li>
            </ul>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Vite 中的配置示例</h2>
            <p>
              本项目的 vite.config.ts 已经为不同阶段配置了响应头。生产环境中通常由 Nginx 统一设置。
            </p>
          </div>
          <pre className="code-block">{`// vite.config.ts
export default defineConfig({
  server: {
    port: 5234,
    headers: { 'Cache-Control': 'no-cache' } // 开发期不缓存
  },
  preview: {
    port: 5234,
    headers: { 'Cache-Control': 'no-cache' } // HTML 入口协商缓存
  },
  build: {
    rollupOptions: {
      output: {
        // 产物带 contenthash，配合 immutable 长缓存
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})`}</pre>
        </section>
      </main>

      <footer className="footer">
        <p>前端性能优化 · 018 · HTTP 缓存机制 · 方案一：Cache-Control 指令</p>
      </footer>
    </div>
  )
}
