import { useState, lazy, Suspense, useEffect, useMemo } from 'react'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import DashboardPage from './pages/DashboardPage'
import SkeletonPage from './components/SkeletonPage'

type Method = 'direct' | 'lazy' | 'lazySkeleton' | 'prefetch'
type PageName = 'home' | 'about' | 'dashboard'

const TABS: { key: Method; label: string; desc: string }[] = [
  {
    key: 'direct',
    label: '方法一: 直接加载',
    desc: '所有页面静态导入，首屏加载慢但切换快（baseline）',
  },
  {
    key: 'lazy',
    label: '方法二: 路由懒加载',
    desc: '页面按需加载，首屏只加载首页，减小初始包体积',
  },
  {
    key: 'lazySkeleton',
    label: '方法三: 懒加载+骨架屏',
    desc: '懒加载 + 骨架屏占位，加载期间不白屏',
  },
  {
    key: 'prefetch',
    label: '方法四: 预加载',
    desc: '首页静态导入，空闲时预取其他页面，兼顾首屏和切换',
  },
]

const PAGES: { key: PageName; label: string }[] = [
  { key: 'home', label: '首页' },
  { key: 'about', label: '关于' },
  { key: 'dashboard', label: '仪表盘' },
]

// 懒加载组件定义（方法二、三共用）
const LazyAbout = lazy(() => import('./pages/AboutPage'))
const LazyDashboard = lazy(() => import('./pages/DashboardPage'))

export default function App() {
  const [method, setMethod] = useState<Method>('lazySkeleton')
  const [currentPage, setCurrentPage] = useState<PageName>('home')
  const [prefetched, setPrefetched] = useState(false)

  // 方法四：空闲时预取其他页面
  useEffect(() => {
    if (method !== 'prefetch') return
    if (prefetched) return

    const prefetch = () => {
      // 预取其他页面模块
      import('./pages/AboutPage')
      import('./pages/DashboardPage')
      setPrefetched(true)
      console.log('[预加载] 已在空闲时间预取 About 和 Dashboard 页面')
    }

    // 使用 requestIdleCallback 在空闲时预取
    if ('requestIdleCallback' in window) {
      const id = (window as Window).requestIdleCallback(prefetch, { timeout: 3000 })
      return () => (window as Window).cancelIdleCallback(id)
    } else {
      const timer = setTimeout(prefetch, 1000)
      return () => clearTimeout(timer)
    }
  }, [method, prefetched])

  const currentDesc = useMemo(() => TABS.find((t) => t.key === method)?.desc ?? '', [method])

  // 根据方法渲染页面内容
  const renderPage = () => {
    if (method === 'direct') {
      // 方法一：直接加载（所有页面已静态导入）
      switch (currentPage) {
        case 'home':
          return <HomePage />
        case 'about':
          return <AboutPage />
        case 'dashboard':
          return <DashboardPage />
      }
    }

    if (method === 'lazy') {
      // 方法二：懒加载 + 简单 loading 文字
      switch (currentPage) {
        case 'home':
          return <HomePage />
        case 'about':
          return (
            <Suspense
              fallback={
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>加载中...</div>
              }
            >
              <LazyAbout />
            </Suspense>
          )
        case 'dashboard':
          return (
            <Suspense
              fallback={
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>加载中...</div>
              }
            >
              <LazyDashboard />
            </Suspense>
          )
      }
    }

    if (method === 'lazySkeleton') {
      // 方法三：懒加载 + 骨架屏
      switch (currentPage) {
        case 'home':
          return <HomePage />
        case 'about':
          return (
            <Suspense fallback={<SkeletonPage />}>
              <LazyAbout />
            </Suspense>
          )
        case 'dashboard':
          return (
            <Suspense fallback={<SkeletonPage />}>
              <LazyDashboard />
            </Suspense>
          )
      }
    }

    if (method === 'prefetch') {
      // 方法四：预加载（首页静态，其他懒加载 + 空闲预取）
      switch (currentPage) {
        case 'home':
          return <HomePage />
        case 'about':
          return (
            <Suspense fallback={<SkeletonPage />}>
              <LazyAbout />
            </Suspense>
          )
        case 'dashboard':
          return (
            <Suspense fallback={<SkeletonPage />}>
              <LazyDashboard />
            </Suspense>
          )
      }
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>React + TS + Vite - SPA 首屏加载优化</h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        SPA 应用首屏加载慢的根因：所有页面代码打包在一个 JS
        文件中，首次加载时需要下载和解析全部代码。
      </p>

      {/* 方法切换 Tab */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setMethod(tab.key)
              setCurrentPage('home')
            }}
            style={{
              padding: '8px 16px',
              background: method === tab.key ? '#1677ff' : '#fff',
              color: method === tab.key ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{
          marginBottom: '16px',
          padding: '10px 16px',
          background: '#f5f5f5',
          borderRadius: '6px',
          color: '#666',
          fontSize: '14px',
        }}
      >
        {currentDesc}
        {method === 'prefetch' && prefetched && (
          <span style={{ color: '#52c41a', marginLeft: '8px' }}>✓ 已预取其他页面</span>
        )}
      </div>

      {/* 页面导航 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {PAGES.map((page) => (
          <button
            key={page.key}
            onClick={() => setCurrentPage(page.key)}
            style={{
              padding: '6px 14px',
              background: currentPage === page.key ? '#333' : '#fff',
              color: currentPage === page.key ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* 页面内容区域 */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          background: '#fff',
          minHeight: '300px',
        }}
      >
        {renderPage()}
      </div>
    </div>
  )
}
