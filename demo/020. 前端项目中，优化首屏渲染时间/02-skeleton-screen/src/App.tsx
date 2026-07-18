import { useState, useEffect, useRef } from 'react'
import { lazy, Suspense } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { SkeletonList } from './components/Skeleton'
import { CodeBlock } from './components/CodeBlock'
import { Toggle } from './components/Toggle'

// 代码分割：React.lazy 将 CardList / ArticleList 拆成独立 chunk
// 仅在用户切到对应 tab 时才发起请求
const LazyCardList = lazy(() => import('./lazy/CardList'))
const LazyArticleList = lazy(() => import('./lazy/ArticleList'))

type NetworkSpeed = 'fast' | 'slow'
type LoadingStyle = 'skeleton' | 'blank'
type TabKey = 'cards' | 'articles'

const NETWORK_DELAY: Record<NetworkSpeed, { chunk: number; data: number }> = {
  fast: { chunk: 150, data: 600 },
  slow: { chunk: 900, data: 1800 },
}

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

const panelStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 10,
  minHeight: 320,
  background: '#0f1115',
  padding: 16,
}

const blankFallbackStyle: CSSProperties = {
  padding: 24,
  color: 'var(--muted)',
  fontSize: 13,
  textAlign: 'center',
}

export default function App() {
  const [network, setNetwork] = useState<NetworkSpeed>('slow')
  const [loadingStyle, setLoadingStyle] = useState<LoadingStyle>('skeleton')
  const [tab, setTab] = useState<TabKey>('cards')
  const [reloadKey, setReloadKey] = useState(0)

  const delay = NETWORK_DELAY[network]
  const fallback =
    loadingStyle === 'skeleton' ? (
      tab === 'cards' ? (
        <SkeletonList count={4} type="card" />
      ) : (
        <SkeletonList count={3} type="article" />
      )
    ) : (
      <div style={blankFallbackStyle}>⏳ 加载中（空白占位）...</div>
    )

  return (
    <div>
      <header className="app-header">
        <h1>方案二：骨架屏 + 代码分割</h1>
        <p>
          使用 React.lazy + Suspense 进行代码分割，缩小首屏 JS 体积；在 chunk 加载与数据请求期间
          渲染骨架屏，避免空白闪烁，提升用户感知性能与 CLS 指标。
        </p>
      </header>

      <section style={heroStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <Control label="模拟网络">
            <Toggle
              options={[
                { value: 'fast', label: '⚡ 4G 快速' },
                { value: 'slow', label: '🐢 3G 慢速' },
              ]}
              value={network}
              onChange={(v) => setNetwork(v as NetworkSpeed)}
            />
          </Control>
          <Control label="加载占位">
            <Toggle
              options={[
                { value: 'skeleton', label: '✅ 骨架屏' },
                { value: 'blank', label: '❌ 空白占位' },
              ]}
              value={loadingStyle}
              onChange={(v) => setLoadingStyle(v as LoadingStyle)}
            />
          </Control>
          <Control label="切换模块">
            <Toggle
              options={[
                { value: 'cards', label: '卡片列表' },
                { value: 'articles', label: '文章列表' },
              ]}
              value={tab}
              onChange={(v) => setTab(v as TabKey)}
            />
          </Control>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            style={{
              background: 'var(--accent)',
              color: '#0f1115',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            ↻ 重新加载
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>
          🧪 实时演示（{network === 'slow' ? '3G 慢速' : '4G 快速'} ·{' '}
          {loadingStyle === 'skeleton' ? '骨架屏' : '空白'}）
        </h2>
        <div style={panelStyle}>
          <LoadingProgress network={network} />
          <Suspense fallback={fallback}>
            {tab === 'cards' ? (
              <LazyCardList key={'c-' + reloadKey} delay={delay.data} />
            ) : (
              <LazyArticleList key={'a-' + reloadKey} delay={delay.data} />
            )}
          </Suspense>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
          说明：React.lazy 会将 CardList / ArticleList 单独打包为 chunk。切换网络速度可看到 chunk
          下载与数据请求耗时的变化；切换加载占位可直观对比「空白闪烁」与「骨架屏」的体验差异。
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>📊 空白加载 vs 骨架屏：感知体验对比</h2>
        <ComparisonTable />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>💻 代码示例</h2>
        <CodeExamples />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>🎯 实施要点</h2>
        <Tips />
      </section>
    </div>
  )
}

function Control({
  label,
  children,
}: {
  label: string
  children?: ReactNode
  key?: string | number
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

function LoadingProgress({ network }: { network: NetworkSpeed }) {
  const [phase, setPhase] = useState<'chunk' | 'data' | 'done'>('chunk')
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const phaseRef = useRef<'chunk' | 'data' | 'done'>('chunk')

  useEffect(() => {
    setPhase('chunk')
    phaseRef.current = 'chunk'
    setProgress(0)
    const durations = NETWORK_DELAY[network]
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const currentPhase = phaseRef.current
      const base = currentPhase === 'chunk' ? 0 : durations.chunk
      const dur = currentPhase === 'chunk' ? durations.chunk : durations.data
      const p = Math.min((elapsed - base) / dur, 1)
      setProgress(p)

      if (currentPhase === 'chunk' && p >= 1) {
        phaseRef.current = 'data'
        setPhase('data')
        rafRef.current = requestAnimationFrame(tick)
      } else if (currentPhase === 'data' && p >= 1) {
        phaseRef.current = 'done'
        setPhase('done')
      } else if (currentPhase !== 'done') {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [network])

  const label = phase === 'chunk' ? '下载 JS chunk' : phase === 'data' ? '请求数据' : '完成'
  const color = phase === 'chunk' ? 'var(--warn)' : phase === 'data' ? 'var(--accent)' : '#60a5fa'

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--muted)',
          marginBottom: 4,
        }}
      >
        <span>阶段：{label}</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: color,
            transition: 'width 60ms linear',
          }}
        />
      </div>
    </div>
  )
}

function ComparisonTable() {
  const rows: ReactNode[] = [
    <Row
      key="1"
      dim="首次内容绘制（FCP）"
      blank="较晚（chunk 下载完才绘制）"
      skeleton="早（骨架立即可见）"
      winner="skeleton"
    />,
    <Row
      key="2"
      dim="视觉稳定性（CLS）"
      blank="差（内容突然撑开布局）"
      skeleton="好（骨架占位尺寸一致）"
      winner="skeleton"
    />,
    <Row
      key="3"
      dim="用户焦虑感"
      blank="高（白屏 → 怀疑卡死）"
      skeleton="低（看到结构 → 觉得在加载）"
      winner="skeleton"
    />,
    <Row key="4" dim="加载总耗时" blank="相同" skeleton="相同（不改变真实耗时）" winner="tie" />,
    <Row key="5" dim="实现成本" blank="零" skeleton="需设计与维护骨架" winner="blank" />,
  ]
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={thStyle}>维度</th>
            <th style={thStyle}>空白加载</th>
            <th style={thStyle}>骨架屏</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

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
}

function Row({
  dim,
  blank,
  skeleton,
  winner,
}: {
  dim: string
  blank: string
  skeleton: string
  winner: 'skeleton' | 'blank' | 'tie'
  key?: string | number
}) {
  return (
    <tr>
      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 600 }}>{dim}</td>
      <td style={{ ...tdStyle, color: winner === 'blank' ? 'var(--accent)' : 'var(--muted)' }}>
        {blank}
      </td>
      <td style={{ ...tdStyle, color: winner === 'skeleton' ? 'var(--accent)' : 'var(--muted)' }}>
        {skeleton}
      </td>
    </tr>
  )
}

function CodeExamples() {
  return (
    <div>
      <CodeBlock
        title="1. 用 React.lazy 拆分组件为独立 chunk"
        lang="tsx"
        code={`import { lazy, Suspense } from 'react'
import { SkeletonList } from './Skeleton'

// 仅在用到时才加载，独立打包为 CardList.[hash].js
const CardList = lazy(() => import('./lazy/CardList'))

function App() {
  return (
    <Suspense fallback={<SkeletonList count={4} type="card" />}>
      <CardList delay={600} />
    </Suspense>
  )
}`}
      />
      <CodeBlock
        title="2. 骨架屏组件：保持与真实内容一致的尺寸"
        lang="tsx"
        code={`export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 14 }}>
      <span className="skeleton-block" style={{ width: 56, height: 56 }} />
      <div style={{ flex: 1 }}>
        <span className="skeleton-block" style={{ width: '50%', height: 14 }} />
        <span className="skeleton-block" style={{ width: '100%', height: 10, marginTop: 8 }} />
      </div>
    </div>
  )
}

/* CSS：用 shimmer 动画给出"正在加载"的暗示 */
// .skeleton-block {
//   background: linear-gradient(90deg, #232833 0%, #2f3644 50%, #232833 100%);
//   background-size: 800px 100%;
//   animation: skeleton-shimmer 1.4s ease-in-out infinite;
// }`}
      />
      <CodeBlock
        title="3. vite.config.ts：进一步手动分包"
        lang="ts"
        code={`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // react/react-dom 单独成包，便于长缓存
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})`}
      />
      <CodeBlock
        title="4. 预取下一个可能用到的 chunk（hover 触发）"
        lang="tsx"
        code={`function TabButton({ onActivate }: { onActivate: () => void }) {
  const handleEnter = () => {
    // 鼠标 hover 时预取，点击时几乎瞬时可见
    import('./lazy/ArticleList')
  }
  return (
    <button onMouseEnter={handleEnter} onClick={onActivate}>
      文章列表
    </button>
  )
}`}
      />
    </div>
  )
}

function Tips() {
  const items: ReactNode[] = [
    <TipItem
      key="1"
      title="✅ 骨架尺寸要准"
      desc="骨架的结构、尺寸、间距需与真实内容一致，避免内容到达时布局跳动（CLS）。"
    />,
    <TipItem
      key="2"
      title="✅ 分包粒度合理"
      desc="按路由 / 用户路径分包，配合 prefetch 预取；过细的分包反而增加请求开销。"
    />,
    <TipItem
      key="3"
      title="✅ 双层骨架"
      desc="Suspense fallback 用于 JS chunk 下载；组件内部用骨架用于数据请求，二者可叠加。"
    />,
    <TipItem
      key="4"
      title="⚠️ 避免长时间闪烁"
      desc="数据到达后骨架应立即被替换；若 loading < 200ms，可不显示骨架避免闪烁。"
    />,
  ]
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
      }}
    >
      {items}
    </div>
  )
}

function TipItem({ title, desc }: { title: string; desc: string; key?: string | number }) {
  return (
    <div
      style={{
        background: '#0f1115',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{title}</div>
      <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}
