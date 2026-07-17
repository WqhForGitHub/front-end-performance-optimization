import { useState, useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Timeline, type TimelinePhase } from './components/Timeline'
import { CodeBlock } from './components/CodeBlock'
import { Toggle } from './components/Toggle'

type RenderMode = 'csr' | 'ssr' | 'ssg'

const CSR_PHASES: TimelinePhase[] = [
  { label: 'HTML 下载（空 #root）', start: 0, end: 80, color: '#60a5fa' },
  { label: '解析 HTML', start: 80, end: 140, color: '#34d399' },
  { label: '下载 JS bundle', start: 140, end: 560, color: '#a78bfa' },
  { label: '解析 + 执行 JS', start: 560, end: 820, color: '#fbbf24' },
  { label: 'React render', start: 820, end: 920, color: '#f472b6' },
  { label: 'FCP 首次绘制', start: 920, end: 920, color: '#f472b6', marker: true },
  { label: 'LCP 最大绘制', start: 980, end: 980, color: '#ec4899', marker: true },
]

const SSR_PHASES: TimelinePhase[] = [
  { label: 'HTML 下载（含首屏 DOM）', start: 0, end: 120, color: '#60a5fa' },
  { label: '解析 HTML', start: 120, end: 180, color: '#34d399' },
  { label: 'FCP 首次绘制', start: 180, end: 180, color: '#f472b6', marker: true },
  { label: 'JS bundle 下载（并行）', start: 180, end: 600, color: '#a78bfa' },
  { label: 'JS 解析执行', start: 600, end: 820, color: '#fbbf24' },
  { label: 'hydrate 复用 DOM', start: 820, end: 900, color: '#22d3ee' },
  { label: 'LCP 最大绘制', start: 220, end: 220, color: '#ec4899', marker: true },
]

const SSG_PHASES: TimelinePhase[] = [
  { label: '静态 HTML 下载（CDN 命中）', start: 0, end: 60, color: '#60a5fa' },
  { label: '解析 HTML', start: 60, end: 110, color: '#34d399' },
  { label: 'FCP 首次绘制', start: 110, end: 110, color: '#f472b6', marker: true },
  { label: 'JS bundle 下载（并行）', start: 110, end: 480, color: '#a78bfa' },
  { label: 'JS 解析执行', start: 480, end: 680, color: '#fbbf24' },
  { label: 'hydrate 复用 DOM', start: 680, end: 740, color: '#22d3ee' },
  { label: 'LCP 最大绘制', start: 140, end: 140, color: '#ec4899', marker: true },
]

const heroStyle: CSSProperties = {
  padding: '24px 20px',
  background: 'linear-gradient(135deg, #1a1d24 0%, #0f1115 100%)',
  borderRadius: 14,
  border: '1px solid var(--border)',
  marginBottom: 24,
}

const cardStyle: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 20,
  marginBottom: 18,
}

const metricRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
  marginBottom: 16,
}

const metricCellStyle: CSSProperties = {
  background: '#0f1115',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px 12px',
  textAlign: 'center',
}

const MODE_META: Record<RenderMode, { phases: TimelinePhase[]; fcp: number; lcp: number; tti: number; label: string; desc: string; color: string }> = {
  csr: {
    phases: CSR_PHASES,
    fcp: 920,
    lcp: 980,
    tti: 1100,
    label: 'CSR 客户端渲染',
    desc: '服务器只返回空 #root 的 HTML，浏览器必须下载并执行完 JS 后才能看到内容。',
    color: '#f87171',
  },
  ssr: {
    phases: SSR_PHASES,
    fcp: 180,
    lcp: 220,
    tti: 900,
    label: 'SSR 服务端渲染',
    desc: '服务器在请求时实时渲染出首屏 HTML，浏览器拿到即可显示，再由 JS hydrate 接管。',
    color: '#fbbf24',
  },
  ssg: {
    phases: SSG_PHASES,
    fcp: 110,
    lcp: 140,
    tti: 740,
    label: 'SSG / 预渲染',
    desc: '构建期就把首屏 HTML 渲染好作为静态文件，CDN 直接返回，FCP 几乎等于 HTML 下载时间。',
    color: '#4ade80',
  },
}

export default function App() {
  const [mode, setMode] = useState<RenderMode>('ssg')
  const meta = MODE_META[mode]

  return (
    <div>
      <header className="app-header">
        <h1>方案三：SSR / 预渲染</h1>
        <p>
          通过服务端渲染（SSR）或构建期预渲染（SSG/Prerender），让浏览器拿到 HTML 时即包含首屏 DOM，
          无需等待 JS 下载与执行，FCP / LCP 显著提前，同时有利于 SEO 与弱网体验。
        </p>
      </header>

      <section style={heroStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>渲染模式</div>
            <Toggle
              options={[
                { value: 'csr', label: 'CSR 客户端' },
                { value: 'ssr', label: 'SSR 服务端' },
                { value: 'ssg', label: 'SSG 预渲染' },
              ]}
              value={mode}
              onChange={(v) => setMode(v as RenderMode)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, color: meta.color, fontWeight: 700, marginBottom: 4 }}>{meta.label}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{meta.desc}</div>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>📊 性能指标对比</h2>
        <div style={metricRowStyle}>
          <MetricCell label="FCP 首次绘制" value={meta.fcp} unit="ms" highlight={mode !== 'csr'} />
          <MetricCell label="LCP 最大绘制" value={meta.lcp} unit="ms" highlight={mode !== 'csr'} />
          <MetricCell label="TTI 可交互时间" value={meta.tti} unit="ms" highlight={mode === 'ssg'} />
        </div>
        <Timeline phases={meta.phases} total={1400} />
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
          说明：以上为示意数据。SSR/SSG 把首屏 DOM 提前到 HTML 阶段，FCP 大幅提前；
          但 TTI 仍取决于 JS 下载与 hydrate 时间，所以「看到内容」和「能交互」之间仍可能有间隔。
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>🧪 浏览器视角：收到 HTML 时的差异</h2>
        <BrowserView mode={mode} />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>📄 预渲染产出的 HTML 长什么样？</h2>
        <HtmlOutputExamples />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>💻 代码示例</h2>
        <CodeExamples />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>🧭 方案选型对比</h2>
        <ModeComparisonTable />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>🎯 实施要点</h2>
        <Tips />
      </section>
    </div>
  )
}

function MetricCell({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: number
  unit: string
  highlight?: boolean
}) {
  return (
    <div style={metricCellStyle}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: highlight ? 'var(--accent)' : 'var(--text)' }}>
        {value}
        <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  )
}

function BrowserView({ mode }: { mode: RenderMode }) {
  const [stage, setStage] = useState<'html' | 'paint' | 'js' | 'interactive'>('html')
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setStage('html')
    const timings: Record<RenderMode, { paint: number; js: number; interactive: number }> = {
      csr: { paint: 920, js: 820, interactive: 1100 },
      ssr: { paint: 180, js: 820, interactive: 900 },
      ssg: { paint: 110, js: 680, interactive: 740 },
    }
    const t = timings[mode]
    const start = performance.now()
    let current: 'html' | 'paint' | 'js' | 'interactive' = 'html'

    const tick = (now: number) => {
      const elapsed = now - start
      if (elapsed >= t.interactive) current = 'interactive'
      else if (elapsed >= t.js) current = 'js'
      else if (elapsed >= t.paint) current = 'paint'
      else current = 'html'
      setStage(current)
      if (current !== 'interactive') {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [mode])

  const showContent = mode !== 'csr' ? stage !== 'html' : stage === 'paint' || stage === 'js' || stage === 'interactive'

  return (
    <div>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: '#0f1115',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ background: '#1a1d24', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)' }}>
          浏览器窗口 · 阶段：<span style={{ color: 'var(--accent)' }}>{stageLabel(stage)}</span>
        </div>
        <div style={{ padding: 18, minHeight: 160 }}>
          {!showContent && (
            <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
              {mode === 'csr' ? '⏳ 空白：等待 JS 下载并执行...' : '⏳ 等待 HTML 解析完成...'}
            </div>
          )}
          {showContent && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>
                🏠 首屏标题：性能优化指南
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
                这段文字来自预渲染 HTML，浏览器拿到 HTML 就能立即显示。
                此时按钮还不可点击（JS 还在加载 / hydrate 中）。
              </div>
              <button
                disabled={stage !== 'interactive'}
                style={{
                  background: stage === 'interactive' ? 'var(--accent)' : '#2a2f3a',
                  color: stage === 'interactive' ? '#0f1115' : 'var(--muted)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: stage === 'interactive' ? 'pointer' : 'not-allowed',
                }}
              >
                {stage === 'interactive' ? '点我（已 hydrate）' : '不可交互（hydrate 中）'}
              </button>
            </div>
          )}
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
        {mode === 'csr' && 'CSR：HTML 几乎是空壳，所有可见内容都来自 JS 执行后的 React 渲染。'}
        {mode === 'ssr' && 'SSR：HTML 中已包含首屏 DOM，FCP 早；但 hydrate 完成前按钮不可交互。'}
        {mode === 'ssg' && 'SSG/预渲染：HTML 是构建期生成好的静态文件，CDN 直接返回，FCP 最早。'}
      </p>
    </div>
  )
}

function stageLabel(stage: 'html' | 'paint' | 'js' | 'interactive'): string {
  switch (stage) {
    case 'html':
      return '下载 / 解析 HTML'
    case 'paint':
      return '已绘制（FCP）'
    case 'js':
      return 'JS 执行 / hydrate 中'
    case 'interactive':
      return '可交互（TTI）'
  }
}

function HtmlOutputExamples() {
  return (
    <div>
      <CodeBlock
        title="CSR 产物：index.html（#root 为空）"
        lang="html"
        code={`<!doctype html>
<html>
<head>...</head>
<body>
  <!-- 几乎是空壳，必须等 JS 执行后才有内容 -->
  <div id="root"></div>
  <script src="/assets/main.[hash].js"></script>
</body>
</html>`}
      />
      <CodeBlock
        title="SSG / 预渲染产物：index.html（首屏 DOM 已注入）"
        lang="html"
        code={`<!doctype html>
<html>
<head>...</head>
<body>
  <!-- 构建期已渲染好首屏 DOM，浏览器拿到即可显示 -->
  <div id="root">
    <header class="app-header">
      <h1>性能优化指南</h1>
      <p>通过 SSR / 预渲染提升首屏速度</p>
    </header>
    <main>
      <section class="hero">
        <h2>首屏标题</h2>
        <p>这是首屏可见的最小内容...</p>
        <button>开始阅读</button>
      </section>
    </main>
  </div>
  <script src="/assets/main.[hash].js"></script>
</body>
</html>`}
      />
      <CodeBlock
        title="main.tsx：用 hydrateRoot 而不是 createRoot"
        lang="tsx"
        code={`import { hydrateRoot } from 'react-dom/client'
import App from './App'

// hydrate：复用服务端/构建期已存在的 DOM，不重新创建
// 注意：客户端首次渲染结果必须与服务端一致，否则 React 会警告并修复
hydrateRoot(document.getElementById('root')!, <App />)`}
      />
    </div>
  )
}

function CodeExamples() {
  return (
    <div>
      <CodeBlock
        title="1. 构建期预渲染：使用 vite-plugin-prerender（概念示例）"
        lang="ts"
        code={`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePrerenderPlugin } from 'vite-plugin-prerender'

export default defineConfig({
  plugins: [
    react(),
    VitePrerenderPlugin({
      // 需要预渲染的路由
      routes: ['/', '/about', '/docs/intro'],
      // 渲染时使用的视口尺寸
      viewport: { width: 1440, height: 900 },
      // 是否同时提取并内联关键 CSS
      inlineCriticalCss: true,
      // 渲染完成后回调，可用来抓取接口数据并写入 JSON
      onRendered: (route, html) => {
        // html 即将被写入 dist/<route>/index.html
        return html
      },
    }),
  ],
})`}
      />
      <CodeBlock
        title="2. 真正的 SSR：使用 vite-react-ssr / vite-plugin-ssr"
        lang="ts"
        code={`// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr'

export default defineConfig({
  plugins: [react(), ssr()],
})

// server.ts（Node 服务端入口）
import { renderPage } from 'vite-plugin-ssr/server'
import express from 'express'

const app = express()
app.get('*', async (req, res) => {
  // renderPage 会在服务端执行 React 渲染，返回完整 HTML
  const { html } = await renderPage({ urlOriginal: req.originalUrl })
  res.status(200).send(html)
})
app.listen(3000)`}
      />
      <CodeBlock
        title="3. React 18 renderToPipeableStream（Node 流式 SSR）"
        lang="tsx"
        code={`import { renderToPipeableStream } from 'react-dom/server'
import App from './App'

export function handler(req, res) {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ['/assets/main.js'],
    onShellReady() {
      // shell 准备好就开始流式返回，浏览器更早开始接收 HTML
      res.setHeader('content-type', 'text/html')
      pipe(res)
    },
    onError(err) {
      console.error(err)
    },
  })
}`}
      />
      <CodeBlock
        title="4. 客户端 hydrate：避免 hydration mismatch"
        lang="tsx"
        code={`import { hydrateRoot } from 'react-dom/client'
import App from './App'

// 1. 服务端与客户端首次渲染必须一致
// 2. 涉及 window/localStorage/Date 的代码放到 useEffect 中
// 3. 服务端不存在的数据用 useMemo + initial state 注水
hydrateRoot(document.getElementById('root')!, <App />)

// 在 App 中：
function App() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    // 仅在客户端执行，避免 hydration mismatch
    setWidth(window.innerWidth)
  }, [])
  return <div>视口宽度：{width}</div>
}`}
      />
    </div>
  )
}

function ModeComparisonTable() {
  const thStyle: CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--muted)',
    fontWeight: 600,
    fontSize: 12,
  }
  const tdStyle: CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    fontSize: 12,
  }
  const rows: ReactNode[] = [
    <tr key="1">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>HTML 体积</td>
      <td style={tdStyle}>小（空 #root）</td>
      <td style={tdStyle}>较大（含首屏 DOM）</td>
      <td style={tdStyle}>较大（含首屏 DOM）</td>
    </tr>,
    <tr key="2">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>FCP / LCP</td>
      <td style={{ ...tdStyle, color: '#f87171' }}>晚（等 JS）</td>
      <td style={{ ...tdStyle, color: 'var(--warn)' }}>早（HTML 即可绘）</td>
      <td style={{ ...tdStyle, color: 'var(--accent)' }}>最早（CDN 命中）</td>
    </tr>,
    <tr key="3">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>TTI</td>
      <td style={tdStyle}>晚（与 FCP 接近）</td>
      <td style={tdStyle}>较晚（需 hydrate）</td>
      <td style={tdStyle}>较晚（需 hydrate）</td>
    </tr>,
    <tr key="4">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>SEO</td>
      <td style={{ ...tdStyle, color: '#f87171' }}>差（爬虫看不到内容）</td>
      <td style={tdStyle}>好</td>
      <td style={tdStyle}>好</td>
    </tr>,
    <tr key="5">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>服务器开销</td>
      <td style={tdStyle}>低（只发静态）</td>
      <td style={{ ...tdStyle, color: '#f87171' }}>高（每请求都渲染）</td>
      <td style={tdStyle}>低（构建期一次性）</td>
    </tr>,
    <tr key="6">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>内容时效性</td>
      <td style={tdStyle}>实时（前端拉接口）</td>
      <td style={tdStyle}>实时</td>
      <td style={tdStyle}>滞后（重新构建才更新）</td>
    </tr>,
    <tr key="7">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>部署形态</td>
      <td style={tdStyle}>纯静态 CDN</td>
      <td style={tdStyle}>Node 服务</td>
      <td style={tdStyle}>纯静态 CDN</td>
    </tr>,
    <tr key="8">
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>典型场景</td>
      <td style={tdStyle}>后台管理系统</td>
      <td style={tdStyle}>电商、新闻（动态）</td>
      <td style={tdStyle}>博客、文档、营销页</td>
    </tr>,
  ]
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>维度</th>
            <th style={thStyle}>CSR</th>
            <th style={thStyle}>SSR</th>
            <th style={thStyle}>SSG / 预渲染</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

function Tips() {
  const items: ReactNode[] = [
    <TipItem
      key="1"
      title="✅ 静态优先"
      desc="能 SSG 就 SSG：CDN 友好、FCP 最早、服务器零开销。只在需要实时数据时回退到 SSR。"
    />,
    <TipItem
      key="2"
      title="✅ 流式 SSR"
      desc="React 18 的 renderToPipeableStream 支持 shell ready 后立即流式返回，进一步降低 TTFB。"
    />,
    <TipItem
      key="3"
      title="✅ 部分 hydrate"
      desc="首屏立即 hydrate，折叠区/Modal 可用 React.lazy + hydrate 渐进接管，减少 TTI 阻塞。"
    />,
    <TipItem
      key="4"
      title="⚠️ Hydration mismatch"
      desc="服务端与客户端首次渲染必须一致，window/localStorage/Date 等代码要放到 useEffect 中。"
    />,
    <TipItem
      key="5"
      title="⚠️ 服务器压力"
      desc="SSR 每次请求都要渲染，需要缓存（Redis / CDN 边缘渲染 / ISR）兜底，否则扛不住流量。"
    />,
    <TipItem
      key="6"
      title="⚠️ HTML 体积"
      desc="预渲染产物含首屏 DOM，HTML 会变大；配合关键 CSS 内联 + 资源 preload 才能拿到最大收益。"
    />,
  ]
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>{items}</div>
}

function TipItem({ title, desc }: { title: string; desc: string; key?: string | number }) {
  return (
    <div style={{ background: '#0f1115', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{title}</div>
      <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}
