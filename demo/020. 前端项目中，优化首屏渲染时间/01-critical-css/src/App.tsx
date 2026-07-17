import { useState, useEffect, useRef, useCallback } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Timeline, type TimelinePhase } from './components/Timeline'
import { CodeBlock } from './components/CodeBlock'
import { Toggle } from './components/Toggle'

type Mode = 'critical' | 'no-critical'

interface Metrics {
  fcp: number
  lcp: number
  tsf: number
  docLoad: number
}

const PHASES_WITH_CRITICAL: TimelinePhase[] = [
  { label: 'HTML 下载', start: 0, end: 80, color: '#60a5fa' },
  { label: '解析 HTML', start: 80, end: 140, color: '#34d399' },
  { label: '内联 Critical CSS', start: 140, end: 200, color: '#fbbf24', inline: true },
  { label: 'FCP 首次绘制', start: 200, end: 200, color: '#f472b6', marker: true },
  { label: 'JS 下载执行', start: 200, end: 480, color: '#a78bfa' },
  { label: '异步加载剩余 CSS', start: 220, end: 520, color: '#22d3ee', async: true },
  { label: 'LCP 最大内容绘制', start: 520, end: 520, color: '#ec4899', marker: true },
]

const PHASES_WITHOUT_CRITICAL: TimelinePhase[] = [
  { label: 'HTML 下载', start: 0, end: 80, color: '#60a5fa' },
  { label: '解析 HTML', start: 80, end: 140, color: '#34d399' },
  { label: '请求外部 CSS', start: 140, end: 240, color: '#f87171' },
  { label: '下载 + 解析全部 CSS', start: 240, end: 520, color: '#fbbf24' },
  { label: 'FCP 首次绘制', start: 520, end: 520, color: '#f472b6', marker: true },
  { label: 'JS 下载执行', start: 520, end: 820, color: '#a78bfa' },
  { label: 'LCP 最大内容绘制', start: 820, end: 820, color: '#ec4899', marker: true },
]

const METRICS_CRITICAL: Metrics = { fcp: 200, lcp: 520, tsf: 600, docLoad: 80 }
const METRICS_NO_CRITICAL: Metrics = { fcp: 520, lcp: 820, tsf: 920, docLoad: 80 }

const heroStyle: CSSProperties = {
  padding: '32px 24px',
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
  gridTemplateColumns: 'repeat(4, 1fr)',
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

export default function App() {
  const [mode, setMode] = useState<Mode>('critical')
  const [replayKey, setReplayKey] = useState(0)
  const phases = mode === 'critical' ? PHASES_WITH_CRITICAL : PHASES_WITHOUT_CRITICAL
  const metrics = mode === 'critical' ? METRICS_CRITICAL : METRICS_NO_CRITICAL

  const handleReplay = useCallback(() => setReplayKey((k) => k + 1), [])

  return (
    <div>
      <header className="app-header">
        <h1>方案一：关键 CSS 内联 + 异步加载剩余 CSS</h1>
        <p>
          通过把首屏可见区域所需的「关键 CSS」直接内联到 HTML head 中，浏览器无需等待外部 CSS 请求
          即可触发首次内容绘制（FCP），其余 CSS 通过 preload / loadCSS 异步加载。
        </p>
      </header>

      <section style={heroStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>切换加载模式</div>
            <Toggle
              options={[
                { value: 'critical', label: '✅ 关键 CSS 内联' },
                { value: 'no-critical', label: '❌ 外部全量 CSS' },
              ]}
              value={mode}
              onChange={(v) => setMode(v as Mode)}
            />
          </div>
          <button
            onClick={handleReplay}
            style={{
              background: 'var(--accent)',
              color: '#0f1115',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ▶ 重新播放时间线
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>📊 性能指标对比</h2>
        <div style={metricRowStyle}>
          <MetricCell label="FCP 首次绘制" value={metrics.fcp} unit="ms" highlight={mode === 'critical'} />
          <MetricCell label="LCP 最大绘制" value={metrics.lcp} unit="ms" highlight={mode === 'critical'} />
          <MetricCell label="TSF 整体完成" value={metrics.tsf} unit="ms" highlight={mode === 'critical'} />
          <MetricCell
            label="FCP 提升"
            value={Math.round((1 - metrics.fcp / METRICS_NO_CRITICAL.fcp) * 100)}
            unit="%"
            highlight={mode === 'critical'}
          />
        </div>
        <Timeline key={replayKey + mode} phases={phases} total={1000} />
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
          说明：上述时间为模拟数据，实际数值取决于网络、CSS 体积与设备性能。
          关键 CSS 内联后，FCP 通常可从 500ms+ 降到 200ms 量级。
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>🧪 实时演示：首屏可见性</h2>
        <LivePreview mode={mode} />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>📐 提取关键 CSS 的常见做法</h2>
        <ExtractGuide />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>💻 代码示例</h2>
        <CodeExamples />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>🎯 关键收益与注意事项</h2>
        <Benefits />
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

function LivePreview({ mode }: { mode: Mode }) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setProgress(0)
    const startTime = performance.now()
    const duration = mode === 'critical' ? 200 : 520

    const tick = (now: number) => {
      const elapsed = now - startTime
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [mode])

  const visible = progress >= 1

  return (
    <div>
      <div
        style={{
          border: '1px dashed var(--border)',
          borderRadius: 10,
          padding: 16,
          minHeight: 120,
          background: '#0f1115',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {!visible && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60%' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                {mode === 'critical' ? '内联 CSS 已就绪，正在解析 HTML...' : '正在请求并下载外部 CSS...'}
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: mode === 'critical' ? 'var(--accent)' : 'var(--warn)',
                    transition: 'width 60ms linear',
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {visible && (
          <div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--accent)', fontSize: 16 }}>🎉 首屏已绘制（FCP）</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
              这是首屏可见区域的最小内容。其余非关键样式（如折叠区、Modal、底部组件）
              在异步 CSS 加载完成前可能仍不可见，但用户已经能感知到「页面已加载」。
            </p>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
        模拟：{mode === 'critical' ? '内联关键 CSS（约 200ms 触发 FCP）' : '外部全量 CSS（约 520ms 触发 FCP）'}
      </p>
    </div>
  )
}

function ExtractGuide() {
  const steps: ReactNode[] = [
    <div key="1">
      <strong>1. 识别首屏关键样式</strong>
      <p style={{ margin: '4px 0 0', color: 'var(--muted)', lineHeight: 1.6 }}>
        首屏（above-the-fold）指用户不滚动时能看到的视口区域。其关键样式包括：布局容器、
        Header/导航、Hero 区域、字体与颜色变量、按钮/卡片的基础外观。
      </p>
    </div>,
    <div key="2">
      <strong>2. 使用工具自动提取</strong>
      <p style={{ margin: '4px 0 0', color: 'var(--muted)', lineHeight: 1.6 }}>
        常用工具：<code>critical</code>（npm）、<code>penthouse</code>、<code>critters</code>（Vite/Webpack 插件）。
        它们通过无头浏览器渲染目标视口，提取实际用到的 CSS 规则。
      </p>
    </div>,
    <div key="3">
      <strong>3. 内联到 HTML head</strong>
      <p style={{ margin: '4px 0 0', color: 'var(--muted)', lineHeight: 1.6 }}>
        将提取出的关键 CSS 用 <code>&lt;style&gt;</code> 标签内联到 HTML head 中，
        其余 CSS 用 <code>rel="preload"</code> + <code>onload</code> 异步加载。
      </p>
    </div>,
    <div key="4">
      <strong>4. 控制内联体积</strong>
      <p style={{ margin: '4px 0 0', color: 'var(--muted)', lineHeight: 1.6 }}>
        关键 CSS 一般控制在 14KB 以内（HTTP/2 首包大小），过大反而拖慢 HTML 解析。
        过大的样式表应该继续走外部请求 + 缓存策略。
      </p>
    </div>,
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
      {steps}
    </div>
  )
}

function CodeExamples() {
  return (
    <div>
      <CodeBlock
        title="vite.config.ts — 使用 critters 插件自动内联关键 CSS"
        lang="ts"
        code={`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePluginCritical } from 'vite-plugin-critical'

export default defineConfig({
  plugins: [
    react(),
    // 自动提取首屏 CSS 并内联到 HTML
    VitePluginCritical({
      criticalUrl: '/',
      criticalBase: './dist/',
      criticalConfig: {
        inline: true,
        extract: true,
        width: 1300,
        height: 900,
        penthouse: { timeout: 30000 },
      },
    }),
  ],
})`}
      />
      <CodeBlock
        title="index.html — 手动内联 + 异步加载非关键 CSS"
        lang="html"
        code={`<head>
  <!-- 1. 关键 CSS 直接内联 -->
  <style>
    body { margin: 0; font-family: system-ui; }
    .header { height: 56px; background: #1a1d24; }
    .hero { padding: 24px; color: #fff; }
    /* ...首屏可见区域的样式... */
  </style>

  <!-- 2. 非关键 CSS 异步加载（loadCSS pattern） -->
  <link rel="preload" href="/assets/non-critical.css"
        as="style" onload="this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="/assets/non-critical.css">
  </noscript>
</head>`}
      />
      <CodeBlock
        title="使用 critical CLI 一次性提取"
        lang="bash"
        code={`# 安装
npm install -D critical

# 在 package.json scripts 中：
"build:critical": "critical src/index.html dist/index.html --inline --extract --width 1300 --height 900"

# 或在 Node 脚本中调用：
import critical from 'critical'
await critical.generate({
  base: 'dist/',
  src: 'index.html',
  inline: true,
  extract: true,
  width: 1300,
  height: 900,
})`}
      />
    </div>
  )
}

function Benefits() {
  const items: ReactNode[] = [
    <BenefitItem
      key="1"
      title="✅ 显著降低 FCP"
      desc="浏览器拿到 HTML 即可绘制，不再被阻塞渲染的外部 CSS 拖住。"
    />,
    <BenefitItem
      key="2"
      title="✅ 改善 FID / INP"
      desc="首屏主线程不必同步等待大 CSS 解析，交互响应更快。"
    />,
    <BenefitItem
      key="3"
      title="⚠️ 注意：HTML 体积"
      desc="内联 CSS 不走浏览器缓存，每次 HTML 请求都会重复传输，需控制在 ~14KB。"
    />,
    <BenefitItem
      key="4"
      title="⚠️ 注意：动态路由"
      desc="多页面场景下不同页面的关键 CSS 不同，需要按路由分别提取或使用流式内联。"
    />,
  ]
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>{items}</div>
}

function BenefitItem({ title, desc }: { title: string; desc: string; key?: string | number }) {
  return (
    <div style={{ background: '#0f1115', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{title}</div>
      <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}
