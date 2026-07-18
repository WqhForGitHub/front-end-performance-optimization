import { useState, useEffect, lazy, Suspense, type FC } from 'react'
import { usePrefetch } from '../hooks/usePrefetch'
import { NetworkWaterfall, type WaterfallItem } from './NetworkWaterfall'
import Home from '../pages/Home'

// 路由级懒加载组件
const About = lazy<FC>(() => import('../pages/About'))
const Contact = lazy<FC>(() => import('../pages/Contact'))

// 模拟 waterfall：无预取时，路由切换才发起新的 DNS + 连接 + 请求
const noPrefetchWaterfall: WaterfallItem[] = [
  { name: 'main.js', start: 0, duration: 80, type: 'req' },
  { name: 'main.js', start: 80, duration: 200, type: 'res' },
  { name: 'About.js (点击后)', start: 900, duration: 40, type: 'dns' },
  { name: 'About.js (点击后)', start: 940, duration: 80, type: 'conn' },
  { name: 'About.js (点击后)', start: 1020, duration: 30, type: 'req' },
  { name: 'About.js (点击后)', start: 1050, duration: 180, type: 'res' },
]

// 模拟 waterfall：idle 预取后，About.js 在空闲时段下载完成，点击时直接命中缓存
const withPrefetchWaterfall: WaterfallItem[] = [
  { name: 'main.js', start: 0, duration: 80, type: 'req' },
  { name: 'main.js', start: 80, duration: 200, type: 'res' },
  { name: 'About.js (idle 预取)', start: 320, duration: 30, type: 'dns' },
  { name: 'About.js (idle 预取)', start: 350, duration: 80, type: 'conn' },
  { name: 'About.js (idle 预取)', start: 430, duration: 30, type: 'req' },
  { name: 'About.js (idle 预取)', start: 460, duration: 180, type: 'res' },
  { name: 'About.js (命中缓存)', start: 900, duration: 5, type: 'res' },
]

interface LogItem {
  time: string
  msg: string
}

type RouteName = 'home' | 'about' | 'contact'

export const PrefetchDemo: FC = () => {
  const [activeRoute, setActiveRoute] = useState<RouteName>('home')
  const [logs, setLogs] = useState<LogItem[]>([])

  const log = (msg: string): void => {
    const now = new Date()
    const time =
      now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0')
    setLogs((prev) => [...prev, { time, msg }])
  }

  // idle 预取 About
  const aboutPrefetch = usePrefetch(() => import('../pages/About').then((m) => m.default), {
    trigger: 'idle',
  })

  // 手动预取 Contact（hover 触发）
  const contactPrefetch = usePrefetch(() => import('../pages/Contact').then((m) => m.default), {
    trigger: 'manual',
  })

  // 监听预取状态变化，写日志
  useEffect(() => {
    if (aboutPrefetch.status === 'loading') log('开始预取 About chunk')
    if (aboutPrefetch.status === 'done')
      log('About chunk 预取完成，耗时 ' + Math.round(aboutPrefetch.duration) + 'ms')
    if (aboutPrefetch.status === 'error') log('About chunk 预取失败')
  }, [aboutPrefetch.status])

  useEffect(() => {
    if (contactPrefetch.status === 'loading') log('开始预取 Contact chunk')
    if (contactPrefetch.status === 'done')
      log('Contact chunk 预取完成，耗时 ' + Math.round(contactPrefetch.duration) + 'ms')
    if (contactPrefetch.status === 'error') log('Contact chunk 预取失败')
  }, [contactPrefetch.status])

  const switchTo = (route: RouteName): void => {
    log('点击切换到 ' + route)
    setActiveRoute(route)
  }

  return (
    <div className="section">
      <h2>1. 路由级预取（idle / hover / manual）</h2>
      <div className="desc">
        About 路由通过 <code>usePrefetch(trigger:'idle')</code> 在浏览器空闲时自动预取； Contact
        路由通过 hover 触发预取；切换路由时观察日志输出。
      </div>

      <div className="route-grid">
        <div
          className={'route-card' + (activeRoute === 'home' ? ' prefetched' : '')}
          onClick={() => switchTo('home')}
        >
          <div className="title">
            首页 Home
            <span className="status done">同步</span>
          </div>
          <div className="hint">已打包进主 bundle</div>
        </div>

        <div
          className={'route-card' + (aboutPrefetch.status === 'done' ? ' prefetched' : '')}
          onClick={() => switchTo('about')}
        >
          <div className="title">
            关于 About
            <span
              className={
                'status ' +
                (aboutPrefetch.status === 'done'
                  ? 'done'
                  : aboutPrefetch.status === 'loading'
                    ? 'loading'
                    : '')
              }
            >
              {aboutPrefetch.status === 'done'
                ? '已预取'
                : aboutPrefetch.status === 'loading'
                  ? '预取中'
                  : 'idle 触发'}
            </span>
          </div>
          <div className="hint">
            {aboutPrefetch.status === 'done'
              ? '预取耗时 ' + Math.round(aboutPrefetch.duration) + 'ms'
              : '等待浏览器空闲...'}
          </div>
        </div>

        <div
          className={'route-card' + (contactPrefetch.status === 'done' ? ' prefetched' : '')}
          onClick={() => switchTo('contact')}
          onMouseEnter={() => {
            if (contactPrefetch.status === 'idle') {
              log('hover Contact 触发预取')
              contactPrefetch.prefetch()
            }
          }}
        >
          <div className="title">
            联系 Contact
            <span
              className={
                'status ' +
                (contactPrefetch.status === 'done'
                  ? 'done'
                  : contactPrefetch.status === 'loading'
                    ? 'loading'
                    : '')
              }
            >
              {contactPrefetch.status === 'done'
                ? '已预取'
                : contactPrefetch.status === 'loading'
                  ? '预取中'
                  : 'hover 触发'}
            </span>
          </div>
          <div className="hint">
            {contactPrefetch.status === 'done'
              ? '预取耗时 ' + Math.round(contactPrefetch.duration) + 'ms'
              : '鼠标悬停预取'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>当前路由内容</div>
        <div
          style={{
            padding: 16,
            background: '#f9fafb',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            minHeight: 80,
          }}
        >
          {activeRoute === 'home' && <Home />}
          {activeRoute === 'about' && (
            <Suspense fallback={<span>加载中...</span>}>
              <About />
            </Suspense>
          )}
          {activeRoute === 'contact' && (
            <Suspense fallback={<span>加载中...</span>}>
              <Contact />
            </Suspense>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="button" className="btn secondary" onClick={() => contactPrefetch.prefetch()}>
          手动预取 Contact
        </button>
        <button
          type="button"
          className="btn secondary"
          style={{ marginLeft: 8 }}
          onClick={() => setLogs([])}
        >
          清空日志
        </button>
      </div>

      <div className="log">
        {logs.length === 0 ? (
          <div className="log-line" style={{ color: '#64748b' }}>
            暂无日志，进入页面几秒后会看到 About 自动预取...
          </div>
        ) : (
          logs.map((l, i) => (
            <div className="log-line" key={i}>
              <span className="time">{l.time}</span>
              {l.msg}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <NetworkWaterfall
          title="未预取：点击路由才开始请求（白屏 ~330ms）"
          items={noPrefetchWaterfall}
          totalMs={1300}
        />
        <NetworkWaterfall
          title="idle 预取：空闲时下载，点击命中缓存（~5ms）"
          items={withPrefetchWaterfall}
          totalMs={1300}
        />
      </div>
    </div>
  )
}
