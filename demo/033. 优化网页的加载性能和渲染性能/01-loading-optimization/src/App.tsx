import type { FC, ReactNode } from 'react'
import { Suspense, lazy, useEffect, useState } from 'react'

// 1) React.lazy: 路由/组件级代码分割
// HeavyComponent 会被打包成独立 chunk，首屏不会下载
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// 2) 预取缓存：用户 hover 时提前下载，点击时直接命中缓存
const prefetched = { current: false as boolean }

const Card: FC<{ title: string; badge?: string; children: ReactNode }> = ({
  title,
  badge,
  children,
}) => (
  <section className="section">
    <h2>
      {title}
      {badge ? <span className="badge">{badge}</span> : null}
    </h2>
    {children}
  </section>
)

const codeSplitting = `// vite.config.ts: 把第三方库拆出主包
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
      },
    },
  },
}`

const lazyCode = `// 1. React.lazy + Suspense 实现组件级懒加载
const HeavyComponent = lazy(
  () => import('./HeavyComponent')
)

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}`

const prefetchCode = `// 2. 悬停时预取下一个页面/组件
function prefetchHeavy() {
  if (prefetched.current) return
  prefetched.current = true
  // 触发 import 即创建 <link rel="prefetch">
  void import('./HeavyComponent')
}

<button onMouseEnter={prefetchHeavy} onClick={...}>
  悬停预取
</button>`

const preloadCode = `<!-- 3. 在 index.html 中预加载关键资源 -->
<link rel="preload" href="/fonts/main.woff2"
      as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/critical.css" as="style">`

const App: FC = () => {
  const [showHeavy, setShowHeavy] = useState(false)
  const [tab, setTab] = useState<'lazy' | 'prefetch' | 'preload'>('lazy')

  // 在 index.html 注入 preload link 演示
  useEffect(() => {
    const existing = document.querySelector('link[data-demo="preload"]')
    if (existing) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.setAttribute('data-demo', 'preload')
    link.href = 'data:text/plain,'
    link.as = 'fetch'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const handleHoverPrefetch = () => {
    if (prefetched.current) return
    prefetched.current = true
    void import('./HeavyComponent')
  }

  const handleShowHeavy = () => setShowHeavy(true)

  return (
    <div className="app">
      <header className="header">
        <h1>01 加载性能优化 (Loading Performance)</h1>
        <p>
          通过代码分割、懒加载、预取/预加载等手段，减少首屏体积，缩短可交互时间 (TTI)。 端口: 5270
        </p>
      </header>

      <Card title="策略总览" badge="overview">
        <ul className="list">
          <li>
            <strong>代码分割 (Code Splitting)</strong>: 按 route / component 拆分 chunk，按需加载
          </li>
          <li>
            <strong>懒加载 (Lazy Load)</strong>: React.lazy + Suspense，组件级别延迟加载
          </li>
          <li>
            <strong>预取 (Prefetch)</strong>: 空闲时段下载未来可能用到的资源
          </li>
          <li>
            <strong>预加载 (Preload)</strong>: 高优先级提前加载关键资源 (字体/CSS/首屏 JS)
          </li>
          <li>
            <strong>第三方库拆分</strong>: manualChunks 把 react/vendor 拆出主包
          </li>
          <li>
            <strong>Tree Shaking</strong>: ES Module 静态分析，剔除未使用代码
          </li>
        </ul>
      </Card>

      <Card title="Bundle 体积对比" badge="bundle size">
        <div className="chart">
          {[
            { name: '原始 (无优化)', size: 580, kb: '580 KB', cls: 'bad' },
            { name: 'Tree Shaking', size: 460, kb: '460 KB', cls: 'warn' },
            { name: 'Vendor 拆分', size: 320, kb: '320 KB', cls: 'warn' },
            { name: '路由懒加载', size: 180, kb: '180 KB', cls: 'good' },
            { name: '组件懒加载+预取', size: 120, kb: '120 KB', cls: 'good' },
          ].map((row) => (
            <div className="bar-row" key={row.name}>
              <span>{row.name}</span>
              <div className={'bar ' + row.cls} style={{ width: (row.size / 580) * 100 + '%' }} />
              <span>{row.kb}</span>
            </div>
          ))}
        </div>
        <div className="note">首屏只加载入口 chunk，其余 chunk 在路由切换/用户交互时按需下载。</div>
      </Card>

      <Card title="代码示例" badge="code">
        <div className="tab-bar">
          {(['lazy', 'prefetch', 'preload'] as const).map((t) => (
            <button
              key={t}
              className={'tab ' + (tab === t ? 'active' : '')}
              onClick={() => setTab(t)}
            >
              {t === 'lazy' ? 'React.lazy' : t === 'prefetch' ? 'Prefetch' : 'Preload'}
            </button>
          ))}
        </div>
        {tab === 'lazy' ? (
          <pre className="code">{lazyCode}</pre>
        ) : tab === 'prefetch' ? (
          <pre className="code">{prefetchCode}</pre>
        ) : (
          <pre className="code">{preloadCode}</pre>
        )}
        <pre className="code">{codeSplitting}</pre>
      </Card>

      <Card title="动态加载演示" badge="live demo">
        <div className="row" style={{ marginBottom: 12 }}>
          <button
            className="btn"
            onMouseEnter={handleHoverPrefetch}
            onClick={handleShowHeavy}
            disabled={showHeavy}
          >
            {showHeavy ? '已加载' : '加载 HeavyComponent'}
          </button>
          <span className="stat">鼠标悬停时会预取该组件 chunk，点击时即可命中缓存秒开</span>
        </div>
        {showHeavy ? (
          <Suspense
            fallback={
              <div className="fallback">
                <span className="spinner" />
                <span>正在下载 chunk...</span>
              </div>
            }
          >
            <HeavyComponent />
          </Suspense>
        ) : (
          <div className="fallback">
            <span
              className="spinner"
              style={{ borderColor: '#e2e8f0', borderTopColor: '#94a3b8' }}
            />
            <span>组件尚未加载，点击按钮触发动态 import()</span>
          </div>
        )}
      </Card>

      <Card title="加载时序对比" badge="waterfall">
        <div className="compare">
          <div className="col">
            <h4>
              <span className="tag red">优化前</span> 一次性加载
            </h4>
            <ul className="list">
              <li>main.js: 580KB (阻塞 1200ms)</li>
              <li>vendor.js: 包含在 main 中</li>
              <li>HeavyComponent: 阻塞首屏</li>
              <li>字体: 等待 JS 后加载</li>
            </ul>
            <div className="stat">首屏 TTI: 约 1800ms</div>
          </div>
          <div className="col">
            <h4>
              <span className="tag green">优化后</span> 分块加载
            </h4>
            <ul className="list">
              <li>main.js: 120KB (阻塞 280ms)</li>
              <li>vendor.js: 200KB (并行)</li>
              <li>HeavyComponent: 按需 / prefetch</li>
              <li>字体: preload 并行</li>
            </ul>
            <div className="stat">首屏 TTI: 约 560ms (-69%)</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default App
