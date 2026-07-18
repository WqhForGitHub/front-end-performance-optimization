import { useCallback, useState, CSSProperties } from 'react'
import {
  techniques,
  withoutPreconnectTimeline,
  withPreconnectTimeline,
  withoutPreloadTimeline,
  withPreloadTimeline,
} from './data/techniques'
import TechniqueCard from './components/TechniqueCard'
import TimelineVisualization from './components/TimelineVisualization'
import LazyImageGallery from './components/LazyImageGallery'
import InjectedLinksPanel from './components/InjectedLinksPanel'

interface InjectedLink {
  rel: string
  html: string
  time: string
}

/**
 * 各技术对应的真实 link 标签配置（用于注入 document.head）
 */
const injectConfig: Record<
  string,
  { href: string; as?: string; crossorigin?: boolean; type?: string }
> = {
  preload: {
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
    as: 'style',
  },
  prefetch: { href: '/next-page.chunk.js', as: 'script' },
  'dns-prefetch': { href: '//cdn.example.com' },
  preconnect: { href: 'https://fonts.googleapis.com', crossorigin: true },
}

function buildLinkHtml(rel: string): string {
  const cfg = injectConfig[rel]
  if (!cfg) return ''
  const parts = [`rel="${rel}"`, `href="${cfg.href}"`]
  if (cfg.as) parts.push(`as="${cfg.as}"`)
  if (cfg.crossorigin) parts.push('crossorigin')
  return `<link ${parts.join(' ')}>`
}

function buildLinkEl(rel: string): HTMLLinkElement {
  const cfg = injectConfig[rel]
  const el = document.createElement('link')
  el.setAttribute('rel', rel)
  el.setAttribute('data-demo', '1')
  if (cfg) {
    el.setAttribute('href', cfg.href)
    if (cfg.as) el.setAttribute('as', cfg.as)
    if (cfg.crossorigin) el.setAttribute('crossorigin', '')
  }
  return el
}

/**
 * 资源加载优化演示
 *
 * 涵盖 preload / prefetch / dns-prefetch / preconnect 四种资源提示（Resource Hints），
 * 以及图片懒加载。提供：
 * 1. 交互式技术卡片，可一键将真实 link 标签注入到 document.head
 * 2. 资源加载时间线对比（优化前 vs 优化后）
 * 3. 图片懒加载可视化对比
 */
export default function App() {
  const [injectedRels, setInjectedRels] = useState<Set<string>>(new Set())
  const [injectedLinks, setInjectedLinks] = useState<InjectedLink[]>([])

  const handleInject = useCallback((rel: string) => {
    setInjectedRels((prev) => {
      if (prev.has(rel)) return prev
      const next = new Set(prev)
      next.add(rel)
      return next
    })

    // 真实注入到 document.head（防止重复）
    const exists = document.head.querySelector(`link[data-demo="1"][rel="${rel}"]`)
    if (!exists) {
      document.head.appendChild(buildLinkEl(rel))
    }

    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setInjectedLinks((prev) => [...prev, { rel, html: buildLinkHtml(rel), time }])
  }, [])

  const pageStyle: CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const sectionStyle: CSSProperties = {
    marginBottom: '28px',
  }

  const sectionTitleStyle: CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 12px 0',
    color: '#333',
    borderLeft: '4px solid #1976d2',
    paddingLeft: '12px',
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  }

  const timelineGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  }

  const noteStyle: CSSProperties = {
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#1565c0',
    lineHeight: '1.6',
    marginBottom: '20px',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>资源加载优化策略</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          preload / prefetch / dns-prefetch / preconnect / 懒加载 的原理与对比
        </p>
      </div>

      <div style={noteStyle}>
        <strong>核心思想：</strong>资源提示（Resource Hints）通过 &lt;link rel="..."&gt;
        告诉浏览器「提前做某事」， 利用浏览器空闲时间和并行能力缩短关键路径。注意：preload
        用于当前页关键资源；prefetch 用于下一页资源； dns-prefetch / preconnect
        用于提前建立到第三方源的连接。
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>四种资源提示技术</h2>
        <div style={gridStyle}>
          {techniques.map((tech) => (
            <div key={tech.rel} style={{ display: 'flex' }}>
              <TechniqueCard
                technique={tech}
                injected={injectedRels.has(tech.rel)}
                onInject={handleInject}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px' }}>
          <InjectedLinksPanel injectedLinks={injectedLinks} />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>加载时间线对比：preconnect</h2>
        <div style={timelineGridStyle}>
          <TimelineVisualization
            title="未使用 preconnect"
            stages={withoutPreconnectTimeline}
            totalSpan={400}
            optimized={false}
          />
          <TimelineVisualization
            title="使用 preconnect 后"
            stages={withPreconnectTimeline}
            totalSpan={400}
            optimized={true}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>加载时间线对比：preload 关键字体</h2>
        <div style={timelineGridStyle}>
          <TimelineVisualization
            title="未使用 preload"
            stages={withoutPreloadTimeline}
            totalSpan={450}
            optimized={false}
          />
          <TimelineVisualization
            title="使用 preload 后"
            stages={withPreloadTimeline}
            totalSpan={450}
            optimized={true}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>图片懒加载</h2>
        <LazyImageGallery />
      </div>
    </div>
  )
}
