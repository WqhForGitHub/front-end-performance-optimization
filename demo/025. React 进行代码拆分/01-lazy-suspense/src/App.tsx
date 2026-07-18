import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import type { FC, ReactNode } from 'react'

// ---- 核心：React.lazy 包装动态 import，每个页面成为独立 chunk ----
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))

type RouteKey = 'home' | 'dashboard' | 'settings' | 'profile'

interface RouteMeta {
  key: RouteKey
  label: string
  color: string
  component: FC
  size: string
  desc: string
}

const ROUTES: RouteMeta[] = [
  {
    key: 'home',
    label: 'Home',
    color: 'bg-home',
    component: Home,
    size: '~60 KB',
    desc: '首屏入口',
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    color: 'bg-dashboard',
    component: Dashboard,
    size: '~95 KB',
    desc: '图表数据',
  },
  {
    key: 'settings',
    label: 'Settings',
    color: 'bg-settings',
    component: Settings,
    size: '~30 KB',
    desc: '低频设置',
  },
  {
    key: 'profile',
    label: 'Profile',
    color: 'bg-profile',
    component: Profile,
    size: '~45 KB',
    desc: '用户中心',
  },
]

const Loading: FC<{ route: string }> = ({ route }) => (
  <div className="suspense-fallback">
    <div className="spinner" />
    <div>正在加载 {route} 路由的独立 chunk ...</div>
    <div style={{ fontSize: 12, color: '#94a3b8' }}>
      这是 Suspense 的 fallback，在动态 import 完成前展示
    </div>
  </div>
)

const App: FC = () => {
  const [route, setRoute] = useState<RouteKey>(() => parseHash())

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((key: RouteKey) => {
    window.location.hash = `#/${key}`
  }, [])

  const current = ROUTES.find((r) => r.key === route) ?? ROUTES[0]
  const Current = current.component

  return (
    <div className="app-shell">
      <nav className="navbar">
        <span className="navbar-brand">01 · React.lazy + Suspense</span>
        {ROUTES.map((r) => (
          <button
            key={r.key}
            className={'nav-btn' + (route === r.key ? ' active' : '')}
            onClick={() => navigate(r.key)}
          >
            {r.label}
          </button>
        ))}
      </nav>

      <main className="main">
        <Suspense fallback={<Loading route={current.label} />}>
          <Current />
        </Suspense>

        <BundleDiagram current={route} />
        <Principles />
      </main>
    </div>
  )
}

function parseHash(): RouteKey {
  const h = window.location.hash.replace(/^#\/?/, '') as RouteKey
  if (['home', 'dashboard', 'settings', 'profile'].includes(h)) return h
  return 'home'
}

// ---- 可视化：拆分后的 chunk 结构 ----
const BundleDiagram: FC<{ current: RouteKey }> = ({ current }) => (
  <div className="page" style={{ marginTop: 24 }}>
    <h2>
      Bundle 拆分结构图 <span className="tag tag-split">visual</span>
    </h2>
    <p>
      下面是 <code>npm run build</code> 后 <code>dist/assets</code> 的预期产物。
      每个路由对应一个独立 <code>.js</code> 文件，首屏只会请求当前路由的 chunk。
    </p>

    <div className="diagram">
      <div className="diagram-title">构建产物（dist/assets/）</div>
      <div className="bundle-row">
        <div className="bundle-box bg-vendor" style={{ flex: 1.2 }}>
          react-vendor.js
          <span className="size">react + react-dom</span>
        </div>
        <div className="bundle-box bg-main" style={{ flex: 0.8 }}>
          main.js
          <span className="size">App + 路由表</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 4px' }}>
        以上为首屏必加载；以下为按路由按需加载：
      </div>
      <div className="bundle-row">
        {ROUTES.map((r) => (
          <div
            key={r.key}
            className={'bundle-box ' + r.color}
            style={{
              flex: 1,
              opacity: current === r.key ? 1 : 0.45,
              outline: current === r.key ? '3px solid #1e293b' : 'none',
              outlineOffset: '2px',
            }}
          >
            {r.label}.js
            <span className="size">{r.size}</span>
            <span className="size">{current === r.key ? '当前已加载' : '未加载'}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#3b82f6' }} />
          实色 = 已下载
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#3b82f6', opacity: 0.45 }} />
          半透明 = 未下载
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#64748b' }} />
          vendor = 第三方库
        </span>
      </div>
    </div>

    <h3>加载流程</h3>
    <div className="flow">
      <span className="bundle-box bg-main" style={{ minWidth: 80 }}>
        main.js
      </span>
      <span className="flow-arrow">-&gt;</span>
      <span className="bundle-box bg-vendor" style={{ minWidth: 90 }}>
        vendor.js
      </span>
      <span className="flow-arrow">-&gt;</span>
      <span className="bundle-box bg-home" style={{ minWidth: 80 }}>
        Home.js
      </span>
      <span className="flow-arrow">=&gt;</span>
      <span style={{ color: '#10b981', fontWeight: 600 }}>首屏渲染完成</span>
    </div>
    <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>
      用户切换路由时，才下载对应 chunk（如 Dashboard.js），并显示 Suspense fallback。
    </div>
  </div>
)

// ---- 拆分原则说明 ----
const Principles: FC = () => {
  const items: Array<{ title: string; body: ReactNode }> = [
    {
      title: '1. 按路由边界拆分',
      body: '路由是天然的代码边界，用户一次只在一个路由，把不同路由拆开收益最直接。',
    },
    {
      title: '2. 首屏优先',
      body: '首屏需要的代码优先打包，非首屏路由一律 lazy，保证最快的 FCP/TTI。',
    },
    {
      title: '3. 配合 Suspense',
      body: 'Suspense 提供统一的 loading 体验，避免每个组件各自处理加载状态。',
    },
    {
      title: '4. 配合 ErrorBoundary',
      body: 'chunk 加载可能失败（弱网、部署中），需用 ErrorBoundary 捕获并提供重试。',
    },
    {
      title: '5. 预取下一路由',
      body: '在空闲时用 import() 预取高概率访问的下一路由，让切换零延迟。',
    },
    {
      title: '6. 不要过度拆分',
      body: '过细的拆分会增加请求数与运行时开销，单路由内部组件通常无需再 lazy。',
    },
  ]
  return (
    <div className="page" style={{ marginTop: 24 }}>
      <h2>React.lazy + Suspense 拆分原则</h2>
      <div className="info-grid">
        {items.map((it) => (
          <div className="info-card" key={it.title}>
            <div className="value">{it.title}</div>
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>{it.body}</div>
          </div>
        ))}
      </div>

      <h3>关键代码</h3>
      <pre className="code-block">{`import { lazy, Suspense } from 'react'

// 每个 lazy 调用 = 一个独立 chunk
const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />   {/* 首次渲染时才发起 chunk 请求 */}
    </Suspense>
  )
}`}</pre>

      <div className="note">
        适用场景：中大型 SPA，路由较多、单路由体积差异大。小型应用（1~2 个路由）拆分收益有限，
        反而增加复杂度，可暂不拆分。
      </div>
    </div>
  )
}

export default App
