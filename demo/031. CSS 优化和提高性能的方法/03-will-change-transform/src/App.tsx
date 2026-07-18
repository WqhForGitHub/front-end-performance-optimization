import {
  Fragment,
  useState,
  useEffect,
  useRef,
  useCallback,
  type FC,
  type CSSProperties,
} from 'react'

/**
 * 03 - GPU 加速：will-change / transform / opacity
 *
 * 演示内容：
 * 1. 对比 left/top 动画（触发重排 reflow + 重绘 repaint）与 transform 动画（仅合成 composite）
 * 2. will-change 属性提示浏览器提前创建图层
 * 3. 实时 FPS 计数器，量化性能差异
 * 4. 多元素动画压力测试
 */

// ============================================================
// 动画类型
// ============================================================
type AnimMode = 'lefttop' | 'transform'
type AnimState = 'idle' | 'running'

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
  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  padding: 32,
  borderRadius: 16,
  marginBottom: 32,
  boxShadow: '0 12px 40px rgba(245, 158, 11, 0.35)',
}

const sectionStyle: CSSProperties = {
  background: 'rgba(30, 41, 59, 0.6)',
  border: '1px solid rgba(245, 158, 11, 0.18)',
  borderRadius: 14,
  padding: 24,
  marginBottom: 24,
  backdropFilter: 'blur(8px)',
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  margin: '0 0 16px',
  color: '#fcd34d',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
}

const badgeStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
  background: 'rgba(245, 158, 11, 0.2)',
  color: '#fde68a',
  border: '1px solid rgba(245, 158, 11, 0.4)',
}

const inlineCodeStyle: CSSProperties = {
  background: 'rgba(245, 158, 11, 0.15)',
  color: '#fde68a',
  padding: '1px 6px',
  borderRadius: 4,
  fontFamily: '"JetBrains Mono", Consolas, monospace',
  fontSize: '0.9em',
}

const codeBlockStyle: CSSProperties = {
  background: '#0b1120',
  border: '1px solid rgba(245, 158, 11, 0.25)',
  borderRadius: 10,
  padding: '16px 18px',
  fontFamily: '"JetBrains Mono", Consolas, monospace',
  fontSize: 12.5,
  lineHeight: 1.7,
  color: '#cbd5e1',
  overflowX: 'auto',
  whiteSpace: 'pre',
  margin: '12px 0 0',
}

const tabButtonStyle = (active: boolean): CSSProperties => ({
  padding: '8px 16px',
  border: '1px solid ' + (active ? '#f59e0b' : 'rgba(148, 163, 184, 0.25)'),
  background: active ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
  color: active ? '#fde68a' : '#94a3b8',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  transition: 'all 0.2s ease',
})

const runButtonStyle: CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #34d399',
  background: 'rgba(52, 211, 153, 0.18)',
  color: '#6ee7b7',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
}

// ============================================================
// 代码示例
// ============================================================
const CODE_LEFTTOP = `/* 方案 A：left/top 动画 - 触发重排 + 重绘 */
.box {
  position: absolute;
  left: 0;
  top: 0;
  /* 每一帧浏览器都要：重排（重新计算布局） + 重绘（重绘像素） + 合成 */
  transition: left 2s linear, top 2s linear;
}

.box.move {
  left: 300px;
  top: 80px;
}`

const CODE_TRANSFORM = `/* 方案 B：transform 动画 - 仅合成，GPU 加速 */
.box {
  position: absolute;
  left: 0;
  top: 0;
  /* transform 不影响布局，浏览器只需在 GPU 上重新合成图层 */
  transition: transform 2s linear;
  will-change: transform; /* 提示浏览器提前创建独立图层 */
}

.box.move {
  transform: translate(300px, 80px);
}`

const CODE_WILL_CHANGE = `/* will-change 用法 */
.gpu-layer {
  /* 告诉浏览器此元素即将发生变化，提前优化：
     1. 创建独立的合成层（layer）
     2. 提前上传到 GPU
     注意：不要滥用，否则会占用大量内存 */
  will-change: transform, opacity;
}

/* 也可以在动画开始前通过 JS 动态设置，动画结束后移除 */
// element.style.willChange = 'transform'
// ... 动画结束后
// element.style.willChange = 'auto'`

// ============================================================
// FPS 计数器 Hook
// ============================================================
function useFps(): { fps: number; frameTime: number } {
  const [fps, setFps] = useState(60)
  const [frameTime, setFrameTime] = useState(16.67)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const lastFrameTimeRef = useRef(performance.now())
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const now = performance.now()
      const dt = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now
      setFrameTime(dt)

      frameCountRef.current++
      if (now - lastTimeRef.current >= 500) {
        // 每 500ms 更新一次 FPS
        const currentFps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current))
        setFps(currentFps)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return { fps, frameTime }
}

// ============================================================
// 组件：动画盒子（单个）
// ============================================================
type AnimBoxProps = {
  mode: AnimMode
  useWillChange: boolean
  running: boolean
  index: number
}

const AnimBox: FC<AnimBoxProps> = ({ mode, useWillChange, running, index }) => {
  const [moved, setMoved] = useState(false)

  useEffect(() => {
    if (!running) {
      setMoved(false)
      return
    }
    // 交替方向，让动画有节奏感
    const interval = setInterval(
      () => {
        setMoved((m) => !m)
      },
      1500 + (index % 3) * 100,
    )
    return () => clearInterval(interval)
  }, [running, index])

  const baseStyle: CSSProperties = {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#0f172a',
    top: (index % 4) * 44,
    left: 0,
  }

  if (mode === 'lefttop') {
    // 方案 A：left/top 动画（重排 + 重绘）
    return (
      <div
        style={{
          ...baseStyle,
          background: '#f87171',
          border: '2px solid #fecaca',
          left: moved ? 280 : 0,
          top: (index % 4) * 44 + (moved ? 20 : 0),
          transition: 'left 1.4s linear, top 1.4s linear',
        }}
      >
        L{index}
      </div>
    )
  }

  // 方案 B：transform 动画（GPU 合成）
  return (
    <div
      style={{
        ...baseStyle,
        background: '#34d399',
        border: '2px solid #a7f3d0',
        transform: moved ? 'translate(280px, 20px)' : 'translate(0, 0)',
        transition: 'transform 1.4s linear',
        willChange: useWillChange ? 'transform' : 'auto',
      }}
    >
      T{index}
    </div>
  )
}

// ============================================================
// 组件：动画舞台（多元素压力测试）
// ============================================================
const AnimationStage: FC<{
  mode: AnimMode
  useWillChange: boolean
  count: number
  running: boolean
}> = ({ mode, useWillChange, count, running }) => {
  return (
    <div
      style={{
        position: 'relative',
        height: 200,
        background: '#0b1120',
        borderRadius: 10,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 11, color: '#64748b' }}>
        {mode === 'lefttop' ? 'left/top 动画（重排 + 重绘）' : 'transform 动画（GPU 合成）'}
        {mode === 'transform' && useWillChange ? ' + will-change' : ''}
      </div>
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, bottom: 0 }}>
        {Array.from({ length: count }, (_, i) => (
          <AnimBox key={i} index={i} mode={mode} useWillChange={useWillChange} running={running} />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 组件：FPS 显示
// ============================================================
const FpsDisplay: FC<{ fps: number; frameTime: number; mode: AnimMode; count: number }> = ({
  fps,
  frameTime,
  mode,
  count,
}) => {
  const color = fps >= 55 ? '#34d399' : fps >= 30 ? '#fbbf24' : '#f87171'
  const label = fps >= 55 ? '流畅' : fps >= 30 ? '卡顿' : '严重卡顿'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <MetricBox label="FPS" value={String(fps)} color={color} hint={label} />
      <MetricBox
        label="帧耗时"
        value={`${frameTime.toFixed(1)}ms`}
        color={color}
        hint={frameTime > 20 ? '掉帧' : '正常'}
      />
      <MetricBox
        label="动画方式"
        value={mode === 'lefttop' ? 'left/top' : 'transform'}
        color={mode === 'lefttop' ? '#f87171' : '#34d399'}
        hint={mode === 'lefttop' ? 'CPU 重排' : 'GPU 合成'}
      />
      <MetricBox label="元素数量" value={String(count)} color="#a78bfa" hint="并发动画" />
    </div>
  )
}

const MetricBox: FC<{ label: string; value: string; color: string; hint: string }> = ({
  label,
  value,
  color,
  hint,
}) => (
  <div
    style={{
      background: '#0b1120',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: 10,
      padding: '12px 14px',
    }}
  >
    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{hint}</div>
  </div>
)

// ============================================================
// 主组件
// ============================================================
const App: FC = () => {
  const [mode, setMode] = useState<AnimMode>('lefttop')
  const [useWillChange, setUseWillChange] = useState(true)
  const [count, setCount] = useState(40)
  const [running, setRunning] = useState(false)
  const { fps, frameTime } = useFps()

  // 历史最大 FPS（用于显示峰值）
  const [peakFps, setPeakFps] = useState(0)
  useEffect(() => {
    if (running && fps > peakFps) setPeakFps(fps)
    if (!running) setPeakFps(0)
  }, [fps, running, peakFps])

  const toggleRun = useCallback(() => {
    setRunning((r) => !r)
  }, [])

  return (
    <div style={containerStyle}>
      <header style={heroStyle}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>
          03 · GPU 加速 will-change / transform / opacity
        </h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>
          CSS 优化方法之三 -- 用 transform / opacity 替代 left/top，结合 will-change 触发 GPU
          合成层，提升动画性能。
        </p>
      </header>

      {/* 概念解释 */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>概念</span>
          浏览器渲染管线与 GPU 加速
        </h2>
        <p style={{ margin: '0 0 12px', color: '#cbd5e1' }}>
          浏览器渲染一帧需要四步：
          <b style={{ color: '#fcd34d' }}>
            样式计算 -&gt; 布局 Layout -&gt; 绘制 Paint -&gt; 合成 Composite
          </b>
          。 不同的 CSS 属性改变会触发不同阶段：
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, color: '#cbd5e1' }}>
          <li>
            <code style={inlineCodeStyle}>left / top / width / height / margin</code> 改变 -&gt;
            <b style={{ color: '#f87171' }}> 重排 + 重绘 + 合成</b>（最昂贵，主线程负担大）。
          </li>
          <li>
            <code style={inlineCodeStyle}>color / background / border-color</code> 改变 -&gt;
            <b style={{ color: '#fbbf24' }}> 重绘 + 合成</b>（中等开销）。
          </li>
          <li>
            <code style={inlineCodeStyle}>transform / opacity</code> 改变 -&gt;
            <b style={{ color: '#34d399' }}> 仅合成</b>（GPU 直接处理，主线程无压力，最流畅）。
          </li>
          <li>
            <code style={inlineCodeStyle}>will-change</code> 提前告知浏览器哪个属性将变化，
            浏览器会预先创建独立合成层（layer），把工作交给 GPU。
          </li>
        </ul>
      </section>

      {/* FPS 显示 */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>实时</span>
          性能指标
        </h2>
        <FpsDisplay fps={fps} frameTime={frameTime} mode={mode} count={count} />
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          峰值 FPS（本次运行）：{peakFps || '--'} · 目标 60 FPS · 低于 30 视为卡顿
        </div>
      </section>

      {/* 控制面板 */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>控制</span>
          动画控制台
        </h2>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: '#94a3b8' }}>动画方式：</span>
          <button style={tabButtonStyle(mode === 'lefttop')} onClick={() => setMode('lefttop')}>
            A: left/top（CPU 重排）
          </button>
          <button style={tabButtonStyle(mode === 'transform')} onClick={() => setMode('transform')}>
            B: transform（GPU 合成）
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: '#94a3b8' }}>will-change：</span>
          <button
            style={tabButtonStyle(useWillChange)}
            onClick={() => setUseWillChange(true)}
            disabled={mode !== 'transform'}
          >
            开启
          </button>
          <button
            style={tabButtonStyle(!useWillChange)}
            onClick={() => setUseWillChange(false)}
            disabled={mode !== 'transform'}
          >
            关闭
          </button>
          <span style={{ fontSize: 11, color: '#64748b' }}>（仅 transform 模式可用）</span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12, color: '#94a3b8' }}>并发元素数：{count}</span>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ flex: 1, minWidth: 200 }}
          />
          <span style={{ fontSize: 11, color: '#64748b' }}>越多越能体现差异</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={runButtonStyle} onClick={toggleRun}>
            {running ? '停止动画' : '开始动画'}
          </button>
        </div>
      </section>

      {/* 双舞台对比 */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>对比</span>
          双舞台实时对比
        </h2>
        <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: 14 }}>
          两个舞台同时运行相同的动画。注意：调节上方「并发元素数」时，差异会非常明显（建议调到
          60+）。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#f87171', marginBottom: 6, fontWeight: 700 }}>
              舞台 A - left/top（CPU 重排）
            </div>
            <AnimationStage mode="lefttop" useWillChange={false} count={count} running={running} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#34d399', marginBottom: 6, fontWeight: 700 }}>
              舞台 B - transform + will-change（GPU 合成）
            </div>
            <AnimationStage mode="transform" useWillChange={true} count={count} running={running} />
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
          观察右侧 FPS 指标：transform 模式即使元素数到 100+ 也能保持 60 FPS，而 left/top 模式通常在
          30-40 元素就开始掉帧。
        </div>
      </section>

      {/* 代码示例 */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>代码</span>
          代码对比
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#f87171', marginBottom: 6 }}>
              方案 A：left/top 动画
            </div>
            <pre style={codeBlockStyle}>{CODE_LEFTTOP}</pre>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#34d399', marginBottom: 6 }}>
              方案 B：transform 动画
            </div>
            <pre style={codeBlockStyle}>{CODE_TRANSFORM}</pre>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>will-change 用法</div>
          <pre style={codeBlockStyle}>{CODE_WILL_CHANGE}</pre>
        </div>
      </section>

      {/* 实践要点 */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <span style={badgeStyle}>实践</span>
          实践要点
        </h2>
        <ul style={{ margin: 0, paddingLeft: 22, color: '#cbd5e1', fontSize: 14 }}>
          <li>
            优先用 <code style={inlineCodeStyle}>transform</code> 和{' '}
            <code style={inlineCodeStyle}>opacity</code> 做动画，避免{' '}
            <code style={inlineCodeStyle}>left/top/width/height</code>。
          </li>
          <li>
            <code style={inlineCodeStyle}>will-change</code> 不要长期开启：会持续占用 GPU
            内存，应「按需开启、结束移除」。
          </li>
          <li>
            不要给太多元素同时设置 <code style={inlineCodeStyle}>will-change</code>
            ，合成层过多反而拖累性能。
          </li>
          <li>
            避免「合成层爆炸」：<code style={inlineCodeStyle}>will-change</code> +
            嵌套元素可能产生过多 layer。
          </li>
          <li>
            其他能触发 GPU 合成的属性：<code style={inlineCodeStyle}>filter</code>、
            <code style={inlineCodeStyle}>backdrop-filter</code>、
            <code style={inlineCodeStyle}>position: fixed</code>、
            <code style={inlineCodeStyle}>3D transform</code>。
          </li>
          <li>
            使用 Chrome DevTools 的 <b>Layers</b> 面板查看合成层，<b>Performance</b>{' '}
            面板分析掉帧原因。
          </li>
        </ul>
      </section>

      <footer style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 32 }}>
        CSS 优化 · 03 · will-change / transform / opacity · port 5269
      </footer>
    </div>
  )
}

export default App
