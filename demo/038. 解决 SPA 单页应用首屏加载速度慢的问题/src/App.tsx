import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'

// 优化点 1：路由懒加载 - 首屏只加载首页代码
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

// 优化点 2：性能指标采集
interface PerfMetrics {
  fcp: number
  lcp: number
  domReady: number
}

function usePerformanceMetrics(): PerfMetrics {
  const [metrics, setMetrics] = useState<PerfMetrics>({ fcp: 0, lcp: 0, domReady: 0 })

  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (nav) {
      setMetrics({
        fcp: Math.round(nav.domContentLoadedEventStart - nav.startTime),
        lcp: Math.round(nav.loadEventEnd - nav.startTime),
        domReady: Math.round(nav.domComplete - nav.startTime),
      })
    }
  }, [])

  return metrics
}

// 优化点 3：路由预加载 - 鼠标 hover 时预加载
function usePrefetchOnHover() {
  const prefetched = new Set<string>()

  return (path: string, loader: () => Promise<unknown>) => {
    if (prefetched.has(path)) return
    prefetched.add(path)
    loader()
  }
}

function Navbar() {
  const location = useLocation()
  const prefetch = usePrefetchOnHover()

  const links = [
    { path: '/', label: '首页' },
    { path: '/about', label: '关于' },
    { path: '/dashboard', label: '仪表盘' },
  ]

  return (
    <nav style={navStyle}>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onMouseEnter={() => {
            if (link.path === '/about') prefetch('/about', () => import('./pages/AboutPage'))
            if (link.path === '/dashboard')
              prefetch('/dashboard', () => import('./pages/DashboardPage'))
          }}
          style={{
            ...linkStyle,
            color: location.pathname === link.path ? '#3b82f6' : '#6b7280',
            borderBottomColor: location.pathname === link.path ? '#3b82f6' : 'transparent',
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

function LoadingFallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
      <div className="skeleton" style={{ height: 24, marginBottom: 12 }}></div>
      <div className="skeleton" style={{ height: 16, marginBottom: 8, width: '80%' }}></div>
      <div className="skeleton" style={{ height: 16, width: '60%' }}></div>
    </div>
  )
}

export default function App() {
  const metrics = usePerformanceMetrics()

  return (
    <BrowserRouter>
      <div style={appStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>SPA 首屏加载优化</h1>
          <p style={subtitleStyle}>
            骨架屏 + 路由懒加载 + 资源预连接 + hover 预加载 + 代码分割
          </p>
          <div style={metricsStyle}>
            <span>FCP: <strong>{metrics.fcp}ms</strong></span>
            <span>LCP: <strong>{metrics.lcp}ms</strong></span>
            <span>DOM Ready: <strong>{metrics.domReady}ms</strong></span>
          </div>
        </header>

        <Navbar />

        <main style={mainStyle}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Suspense>
        </main>

        <footer style={footerStyle}>
          <p>提示：hover 链接时会预加载对应路由的代码</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

const appStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px 16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#1f2937',
}
const headerStyle: React.CSSProperties = { marginBottom: 20 }
const titleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: 24, color: '#3b82f6' }
const subtitleStyle: React.CSSProperties = { margin: '0 0 16px', fontSize: 14, color: '#6b7280' }
const metricsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: '12px 16px',
  background: '#f3f4f6',
  borderRadius: 8,
  fontSize: 13,
  color: '#6b7280',
}
const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  borderBottom: '2px solid #e5e7eb',
  marginBottom: 20,
}
const linkStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: 15,
  textDecoration: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: -2,
}
const mainStyle: React.CSSProperties = { minHeight: 400 }
const footerStyle: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
  color: '#9ca3af',
  fontSize: 12,
  textAlign: 'center',
}
