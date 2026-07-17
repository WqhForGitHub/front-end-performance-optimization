import { useState, useEffect } from 'react'

export default function Home() {
  const [loadTime, setLoadTime] = useState<number>(0)

  useEffect(() => {
    const start = performance.now()
    const id = setTimeout(() => setLoadTime(performance.now() - start), 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="page">
      <h2>Home 首页 <span className="tag tag-load">lazy chunk</span></h2>
      <p>
        这是首页组件。它通过 <code>React.lazy</code> 包装，只有当用户访问 <code>/home</code> 路由时，
        对应的 chunk 才会被浏览器请求并下载。
      </p>

      <div className="diagram">
        <div className="diagram-title">拆分前后对比</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>拆分前：单一大 bundle</div>
          <div className="bundle-row">
            <div className="bundle-box bg-main" style={{ width: '100%' }}>
              app.js (react + router + home + dashboard + settings + profile)
              <span className="size">~ 320 KB</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>拆分后：首屏只加载需要的 chunk</div>
          <div className="bundle-row">
            <div className="bundle-box bg-vendor" style={{ flex: 1 }}>
              vendor.js
              <span className="size">react + react-dom</span>
            </div>
            <div className="bundle-box bg-home" style={{ flex: 1 }}>
              main.js + Home.js
              <span className="size">~ 60 KB</span>
            </div>
            <div className="bundle-box bg-dashboard" style={{ flex: 0.6, opacity: 0.4 }}>
              Dashboard
              <span className="size">按需</span>
            </div>
            <div className="bundle-box bg-settings" style={{ flex: 0.6, opacity: 0.4 }}>
              Settings
              <span className="size">按需</span>
            </div>
            <div className="bundle-box bg-profile" style={{ flex: 0.6, opacity: 0.4 }}>
              Profile
              <span className="size">按需</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metric-row">
        <div className="metric">
          <div className="num timer">{loadTime.toFixed(1)} ms</div>
          <div className="desc">本 chunk 解析耗时（含挂载）</div>
        </div>
        <div className="metric">
          <div className="num">1</div>
          <div className="desc">首屏实际加载的 chunk 数</div>
        </div>
        <div className="metric">
          <div className="num">~ 260 KB</div>
          <div className="desc">节省的下载量（其余路由未加载）</div>
        </div>
      </div>

      <h3>使用方法</h3>
      <pre className="code-block">{`// 1. 用 React.lazy 包装动态 import
const Home = lazy(() => import('./pages/Home'))

// 2. 用 Suspense 包裹，提供 fallback
<Suspense fallback={<Loading />}>
  <Home />
</Suspense>`}</pre>

      <div className="note">
        提示：点击上方导航切换路由，可观察到 loading fallback 与新 chunk 的加载过程。
        打开 DevTools 的 Network 面板可以看到每个路由对应一个独立的 .js 请求。
      </div>
    </div>
  )
}
