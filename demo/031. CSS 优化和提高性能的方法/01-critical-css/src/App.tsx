import { Fragment, useState, useEffect, useRef, type FC, type CSSProperties } from 'react'

/**
 * 01 - Critical CSS 关键 CSS 提取与内联
 *
 * 演示内容：
 * 1. 解释 Critical CSS（首屏关键 CSS）的概念
 * 2. 对比「外链 CSS」vs「内联 Critical CSS + 异步加载剩余 CSS」
 * 3. 加载时间线可视化
 * 4. 关键 CSS 提取的代码示例
 *
 * 全部使用内联样式（inline styles）展示「内联」这一思想。
 */

// ============================================================
// 类型定义
// ============================================================
type TimelinePhase = {
  label: string
  duration: number // 毫秒
  color: string
  desc: string
}

type ApproachKey = 'external' | 'inline'

// ============================================================
// 静态数据
// ============================================================
const TIMELINES: Record<ApproachKey, TimelinePhase[]> = {
  // 方案 A：所有 CSS 走外链，浏览器必须等 CSS 下载完才渲染
  external: [
    { label: 'HTML', duration: 80, color: '#60a5fa', desc: '下载 HTML 文档' },
    { label: 'CSS (阻塞)', duration: 320, color: '#f87171', desc: '下载并解析全部 CSS，阻塞渲染' },
    {
      label: 'FCP',
      duration: 120,
      color: '#fbbf24',
      desc: '首次内容绘制（First Contentful Paint）',
    },
    { label: 'JS', duration: 180, color: '#a78bfa', desc: '执行 JS' },
  ],
  // 方案 B：关键 CSS 内联到 <head>，剩余 CSS 异步加载
  inline: [
    { label: 'HTML', duration: 80, color: '#60a5fa', desc: '下载 HTML（已内联关键 CSS）' },
    { label: 'FCP', duration: 60, color: '#34d399', desc: '立刻首次内容绘制，无需等待外部 CSS' },
    { label: 'JS', duration: 180, color: '#a78bfa', desc: '执行 JS' },
    {
      label: 'CSS (异步)',
      duration: 280,
      color: '#fbbf24',
      desc: '后台异步加载非关键 CSS，不阻塞渲染',
    },
  ],
}

const TOTAL_TIME: Record<ApproachKey, number> = {
  external: TIMELINES.external.reduce((s, p) => s + p.duration, 0),
  inline: TIMELINES.inline.reduce((s, p) => s + p.duration, 0),
}

const FCP_TIME: Record<ApproachKey, number> = {
  external: 80 + 320 + 120, // HTML + CSS + FCP
  inline: 80 + 60, // HTML + FCP
}

// 代码示例字符串
const CODE_EXTERNAL = `<!-- 传统方案：所有 CSS 走外链 -->
<head>
  <link rel="stylesheet" href="/assets/main.css" />
  <!-- 浏览器必须等 main.css 下载解析完才能渲染首屏 -->
</head>`

const CODE_INLINE = `<!-- 优化方案：内联 Critical CSS + 异步加载剩余 CSS -->
<head>
  <style>
    /* Critical CSS：首屏可见区域的最小样式 */
    header, .hero, .nav { display: flex; ... }
    h1 { font-size: 32px; color: #1e293b; }
  </style>
  <!-- 非关键 CSS 异步加载，不阻塞渲染 -->
  <link rel="preload" href="/assets/main.css" as="style"
        onload="this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/assets/main.css" /></noscript>
</head>`

const CODE_EXTRACT = `// 使用 critical 工具自动提取关键 CSS
import critical from 'critical'

critical.generate({
  base: 'dist/',
  src: 'index.html',
  dest: 'index.html',
  inline: {  // 把提取出的关键 CSS 直接内联到 HTML
    minify: true  // 压缩内联 CSS
  },
  dimensions: [
    { width: 375, height: 667 },   // iPhone SE
    { width: 1440, height: 900 }   // Desktop
  ],
  penthouse: { timeout: 60000 }
})

// 或使用 Penthouse 单独生成关键 CSS 文件
// npx penthouse https://example.com > critical.css`

// ============================================================
// 通用样式（内联）
// ============================================================
const containerStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '32px 24px 80px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#e2e8f0',
  lineHeight: 1.6,
}

const heroStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  padding: '32px',
  borderRadius: 16,
  marginBottom: 32,
  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.35)',
}

const heroTitleStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  margin: '0 0 8px',
  color: '#ffffff',
}

const heroSubStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,0.85)',
  fontSize: 15,
}

const sectionStyle: CSSProperties = {
  background: 'rgba(30, 41, 59, 0.6)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: 14,
  padding: '24px',
  marginBottom: 24,
  backdropFilter: 'blur(8px)',
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  margin: '0 0 16px',
  color: '#a5b4fc',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const badgeStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
  background: 'rgba(99, 102, 241, 0.2)',
  color: '#c7d2fe',
  border: '1px solid rgba(99, 102, 241, 0.4)',
}

const codeBlockStyle: CSSProperties = {
  background: '#0b1120',
  border: '1px solid rgba(99, 102, 241, 0.25)',
  borderRadius: 10,
  padding: '16px 18px',
  fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  fontSize: 12.5,
  lineHeight: 1.7,
  color: '#cbd5e1',
  overflowX: 'auto',
  whiteSpace: 'pre',
  margin: '12px 0 0',
}

const tabButtonStyle = (active: boolean): CSSProperties => ({
  padding: '8px 16px',
  border: '1px solid ' + (active ? '#6366f1' : 'rgba(148, 163, 184, 0.25)'),
  background: active ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
  color: active ? '#c7d2fe' : '#94a3b8',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  transition: 'all 0.2s ease',
})

// ============================================================
// 组件：概念解释卡片
// ============================================================
const ConceptCard: FC = () => (
  <section style={sectionStyle}>
    <h2 style={sectionTitleStyle}>
      <span style={badgeStyle}>概念</span>
      什么是 Critical CSS（关键 CSS）？
    </h2>
    <p style={{ margin: '0 0 12px', color: '#cbd5e1' }}>
      <b style={{ color: '#fbbf24' }}>Critical CSS</b>{' '}
      是指用户首屏（above-the-fold）可见区域所需的最小 CSS 集合。 把这部分 CSS 直接内联到 HTML 的{' '}
      <code style={inlineCodeStyle}>{'<head>'}</code> 中，
      浏览器无需等待外部样式表下载即可立即渲染首屏内容，显著缩短 FCP（First Contentful Paint）。
    </p>
    <ul style={{ margin: 0, paddingLeft: 22, color: '#cbd5e1' }}>
      <li>
        浏览器渲染阻塞：HTML 解析遇到{' '}
        <code style={inlineCodeStyle}>{'<link rel="stylesheet">'}</code> 时会暂停渲染，等 CSS
        下载解析完毕。
      </li>
      <li>
        内联关键 CSS 后，首屏立即可见；非关键 CSS 通过 <code style={inlineCodeStyle}>preload</code>{' '}
        异步加载，不阻塞渲染。
      </li>
      <li>适用于首屏内容相对固定、CSS 体积较大的页面（如落地页、电商首页）。</li>
    </ul>
  </section>
)

const inlineCodeStyle: CSSProperties = {
  background: 'rgba(99, 102, 241, 0.15)',
  color: '#c7d2fe',
  padding: '1px 6px',
  borderRadius: 4,
  fontFamily: '"JetBrains Mono", Consolas, monospace',
  fontSize: '0.9em',
}

// ============================================================
// 组件：加载时间线
// ============================================================
const TimelineView: FC<{ approach: ApproachKey }> = ({ approach }) => {
  const phases = TIMELINES[approach]
  const total = TOTAL_TIME[approach]
  const fcp = FCP_TIME[approach]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          height: 36,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(148,163,184,0.2)',
        }}
      >
        {phases.map((p, i) => (
          <div
            key={i}
            style={{
              flex: p.duration,
              background: p.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={p.desc}
          >
            {p.label} {p.duration}ms
          </div>
        ))}
      </div>

      {/* FCP 指示线 */}
      <div style={{ position: 'relative', height: 24, marginTop: 6 }}>
        <div
          style={{
            position: 'absolute',
            left: `${(fcp / total) * 100}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: '#34d399',
            boxShadow: '0 0 8px #34d399',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${(fcp / total) * 100}%`,
            top: 2,
            transform: 'translateX(6px)',
            fontSize: 11,
            color: '#34d399',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          FCP = {fcp}ms
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
        总加载时间：{total}ms · 首次内容绘制：{fcp}ms
      </div>
    </div>
  )
}

// ============================================================
// 组件：代码块（带高亮）
// ============================================================
const CodeBlock: FC<{ code: string; label?: string }> = ({ code, label }) => (
  <div>
    {label ? <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</div> : null}
    <pre style={codeBlockStyle}>{code}</pre>
  </div>
)

// ============================================================
// 组件：FPS / 加载模拟（动画演示阻塞感）
// ============================================================
const LoadSimulation: FC = () => {
  const [approach, setApproach] = useState<ApproachKey>('external')
  const [progress, setProgress] = useState(0) // 0 ~ 100
  const [rendered, setRendered] = useState(false)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    if (running) return
    setRunning(true)
    setProgress(0)
    setRendered(false)

    const fcpThreshold = approach === 'external' ? 65 : 18 // 外链 65% 才渲染，内联 18% 即渲染
    const totalDuration = approach === 'external' ? 1200 : 800
    const step = 100 / (totalDuration / 16)

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step
        if (next >= fcpThreshold && !rendered) setRendered(true)
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          setRunning(false)
          return 100
        }
        return next
      })
    }, 16)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>
        <span style={badgeStyle}>交互</span>
        渲染阻塞模拟（直观感受 FCP 差异）
      </h2>
      <p style={{ margin: '0 0 16px', color: '#cbd5e1', fontSize: 14 }}>
        点击「开始加载」模拟两种方案下的渲染过程。注意观察首屏内容出现的时机（绿色「已渲染」区域）。
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          style={tabButtonStyle(approach === 'external')}
          onClick={() => setApproach('external')}
          disabled={running}
        >
          方案 A：外链 CSS（阻塞）
        </button>
        <button
          style={tabButtonStyle(approach === 'inline')}
          onClick={() => setApproach('inline')}
          disabled={running}
        >
          方案 B：内联 Critical CSS
        </button>
        <button
          style={{ ...tabButtonStyle(false), borderColor: '#34d399', color: '#34d399' }}
          onClick={start}
          disabled={running}
        >
          {running ? '加载中...' : '开始加载'}
        </button>
      </div>

      {/* 进度条 */}
      <div
        style={{
          height: 28,
          background: '#0b1120',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(148,163,184,0.2)',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background:
              approach === 'external'
                ? 'linear-gradient(90deg, #f87171, #fbbf24)'
                : 'linear-gradient(90deg, #34d399, #6366f1)',
            transition: 'width 16ms linear',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 8,
            fontSize: 11,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* 模拟屏幕 */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#0b1120',
          borderRadius: 10,
          border: '1px solid rgba(148,163,184,0.2)',
          minHeight: 100,
          opacity: rendered ? 1 : 0.3,
          transition: 'opacity 0.3s',
        }}
      >
        {rendered ? (
          <Fragment>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>
              首屏已渲染
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1' }}>
              这里是 hero 区域，用户已经看到内容了。
            </div>
          </Fragment>
        ) : (
          <div style={{ fontSize: 13, color: '#64748b' }}>白屏中... 等待 CSS 加载完成才能渲染</div>
        )}
      </div>
    </section>
  )
}

// ============================================================
// 主组件
// ============================================================
const App: FC = () => {
  const [tab, setTab] = useState<'compare' | 'extract'>('compare')

  return (
    <div style={containerStyle}>
      <header style={heroStyle}>
        <h1 style={heroTitleStyle}>01 · Critical CSS 关键 CSS 提取与内联</h1>
        <p style={heroSubStyle}>
          CSS 优化方法之一 —— 把首屏关键样式直接内联到 HTML，消除渲染阻塞，加速 FCP。
        </p>
      </header>

      <ConceptCard />

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>对比</span>
          加载时间线：外链 CSS vs 内联 Critical CSS
        </h2>

        <div style={{ display: 'grid', gap: 24, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>
              方案 A：所有 CSS 走外链（阻塞渲染）
            </div>
            <TimelineView approach="external" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
              方案 B：内联 Critical CSS + 异步加载剩余 CSS
            </div>
            <TimelineView approach="inline" />
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: 8,
            fontSize: 13,
            color: '#a7f3d0',
          }}
        >
          FCP 提升：{FCP_TIME.external}ms -&gt; {FCP_TIME.inline}ms （减少{' '}
          {FCP_TIME.external - FCP_TIME.inline}ms，约{' '}
          {Math.round(((FCP_TIME.external - FCP_TIME.inline) / FCP_TIME.external) * 100)}%）
        </div>
      </section>

      <LoadSimulation />

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>代码</span>
          代码示例
        </h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={tabButtonStyle(tab === 'compare')} onClick={() => setTab('compare')}>
            前后对比
          </button>
          <button style={tabButtonStyle(tab === 'extract')} onClick={() => setTab('extract')}>
            提取工具
          </button>
        </div>

        {tab === 'compare' ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <CodeBlock label="优化前 - 外链 CSS（阻塞渲染）" code={CODE_EXTERNAL} />
            <CodeBlock label="优化后 - 内联 Critical CSS + 异步加载" code={CODE_INLINE} />
          </div>
        ) : (
          <CodeBlock label="使用 critical / penthouse 自动提取关键 CSS" code={CODE_EXTRACT} />
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>实践</span>
          实践要点
        </h2>
        <ul style={{ margin: 0, paddingLeft: 22, color: '#cbd5e1', fontSize: 14 }}>
          <li>
            关键 CSS 通常不超过 <b style={{ color: '#fbbf24' }}>14KB</b>（HTTP/2
            初始拥塞窗口大小），压缩后内联。
          </li>
          <li>
            使用 <code style={inlineCodeStyle}>critical</code>、
            <code style={inlineCodeStyle}>penthouse</code> 等工具自动提取。
          </li>
          <li>
            剩余 CSS 用 <code style={inlineCodeStyle}>rel="preload" + onload</code>{' '}
            异步加载，避免阻塞。
          </li>
          <li>注意：内联 CSS 无法被浏览器缓存，HTML 体积会增大，适合首屏固定、CSS 较大的场景。</li>
          <li>
            构建工具集成：Vite 可用 <code style={inlineCodeStyle}>vite-plugin-critical</code>
            ，Webpack 用 <code style={inlineCodeStyle}>critters</code> 插件。
          </li>
        </ul>
      </section>

      <footer style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 32 }}>
        CSS 优化 · 01 · Critical CSS · port 5267
      </footer>
    </div>
  )
}

export default App
