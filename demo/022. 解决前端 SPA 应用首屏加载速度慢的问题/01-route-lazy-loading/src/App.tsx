import { Suspense, type FC, type MouseEvent } from 'react'
import { useRouter, routes } from './router'
import { LoadingFallback } from './components/LoadingFallback'
import { BundleSizeComparison } from './components/BundleSizeComparison'

const App: FC = () => {
  const { path, navigate } = useRouter()

  // 根据当前 hash 找到对应路由配置；找不到时回退到首页
  const current = routes.find((r) => r.path === path) ?? routes[0]
  const CurrentComponent = current.component

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>方案一：路由级懒加载（React.lazy + Suspense）</h1>
        <span className="badge">SPA 首屏优化 Demo</span>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          {routes.map((r) => (
            <a
              key={r.path}
              href={'#' + r.path}
              className={r.path === path ? 'active' : ''}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                navigate(r.path)
              }}
            >
              {r.label}
              {r.sync ? '（同步）' : '（lazy）'}
            </a>
          ))}
        </aside>

        <main className="app-content">
          {/* Suspense 包裹懒加载路由，加载期间展示 fallback */}
          <Suspense fallback={<LoadingFallback label={'加载 ' + current.label + ' 中...'} />}>
            <div className="page-card">
              <CurrentComponent />
            </div>
          </Suspense>

          <div className="compare-section">
            <BundleSizeComparison />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
