import { useState, useMemo, useCallback, CSSProperties } from 'react'
import { LazyImage } from './components/LazyImage'
import { useImageLoadStats } from './hooks/useLazyImage'

/**
 * 方案一：图片懒加载演示
 * - 使用 picsum.photos 提供 24 张占位图
 * - 支持三种加载模式切换：IO 懒加载 / 原生 loading="lazy" / 立即加载（对照）
 * - 实时统计已请求 / 已加载 / 失败的图片数量
 */
type LoadMode = 'io' | 'native' | 'eager'

interface ImageItem {
  id: number
  src: string
  alt: string
  width: number
  height: number
}

// 构造 24 张测试图，使用 picsum.photos 提供
const IMAGE_COUNT = 24

function buildImages(): ImageItem[] {
  const items: ImageItem[] = []
  for (let i = 0; i < IMAGE_COUNT; i += 1) {
    const seed = 100 + i
    items.push({
      id: seed,
      // 统一 800x600，保证图片有足够体积以观察懒加载效果
      src: `https://picsum.photos/seed/${seed}/800/600`,
      alt: `示例图片 ${i + 1}`,
      width: 800,
      height: 600
    })
  }
  return items
}

const MODE_OPTIONS: { value: LoadMode; label: string; desc: string }[] = [
  { value: 'io', label: 'IO 懒加载', desc: 'IntersectionObserver 控制，进入视口才请求' },
  { value: 'native', label: '原生 lazy', desc: '浏览器原生 loading="lazy"，无需 JS' },
  { value: 'eager', label: '立即加载', desc: '对照：所有图片立即请求，带宽争抢明显' }
]

export default function App() {
  const [mode, setMode] = useState<LoadMode>('io')
  const [rootMargin, setRootMargin] = useState<string>('200px 0px')
  const [reloadKey, setReloadKey] = useState<number>(0)

  // 用 useMemo 避免每次渲染重建数组（否则会触发图片重新请求）
  const images = useMemo(buildImages, [])

  const stats = useImageLoadStats(images.length)

  // 切换模式时重置统计并强制重建列表
  const handleModeChange = useCallback((next: LoadMode) => {
    setMode(next)
    stats.reset()
    setReloadKey((k) => k + 1)
  }, [stats])

  const handleReload = useCallback(() => {
    stats.reset()
    setReloadKey((k) => k + 1)
  }, [stats])

  const handleRootMarginChange = useCallback((value: string) => {
    setRootMargin(value)
  }, [])

  const loadedPercent = images.length === 0
    ? 0
    : Math.round((stats.loadedCount / images.length) * 100)

  const progressStyle: CSSProperties = {
    width: `${loadedPercent}%`
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>方案一：图片懒加载（IntersectionObserver + 原生 loading=&quot;lazy&quot;）</h1>
        <p>
          通过延迟加载视口外的图片，避免一次性发起几十个图片请求造成带宽争抢，
          显著降低首屏 LCP 与可见图片加载时间。本演示共 {images.length} 张图片。
        </p>
      </header>

      <section className="control-panel">
        <div className="control-group">
          <label>加载模式</label>
          <div className="toggle">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={mode === opt.value ? 'active' : ''}
                onClick={() => handleModeChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>预加载距离（rootMargin）</label>
          <div className="toggle">
            {['0px 0px', '200px 0px', '500px 0px'].map((rm) => (
              <button
                key={rm}
                type="button"
                className={rootMargin === rm ? 'active' : ''}
                onClick={() => handleRootMarginChange(rm)}
              >
                {rm}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <button type="button" className="toggle-reset" onClick={handleReload}>
            重新加载
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">总数</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">已请求</span>
            <span className="stat-value">{stats.requestedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">已加载</span>
            <span className="stat-value loaded">{stats.loadedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">失败</span>
            <span className="stat-value">{stats.failedCount}</span>
          </div>
        </div>
      </section>

      <div className="progress-bar">
        <div className="progress-fill" style={progressStyle} />
        <span className="progress-text">{loadedPercent}%</span>
      </div>

      <p className="mode-desc">
        当前模式：<strong>{MODE_OPTIONS.find((o) => o.value === mode)?.label}</strong>
        {' — '}
        {MODE_OPTIONS.find((o) => o.value === mode)?.desc}
      </p>

      <div className="gallery" key={reloadKey}>
        {images.map((img) => (
          <LazyImage
            key={img.id}
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            mode={mode}
            rootMargin={rootMargin}
            onRequested={stats.markRequested}
            onLoaded={stats.markLoaded}
            onError={stats.markFailed}
          />
        ))}
      </div>

      <div className="scroll-hint">向下滚动以触发下方图片的懒加载 ……</div>

      <section className="info-section">
        <h2>原理与对比</h2>

        <h3>1. IntersectionObserver 懒加载（IO 模式）</h3>
        <p>
          组件挂载时不设置 <code>img.src</code>，仅观察元素与视口的交叉状态。
          进入预触发范围（rootMargin）后，再把真实地址写入 <code>src</code> 触发请求。
        </p>
        <pre>
          <code>{`const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      img.src = img.dataset.src   // 真正开始加载
      observer.unobserve(entry.target)
    }
  })
}, { rootMargin: '200px 0px', threshold: 0.01 })

observer.observe(imgElement)`}</code>
        </pre>
        <p>
          优点：可自定义 rootMargin / threshold，体验可控；不支持的浏览器可降级为立即加载。
        </p>

        <h3>2. 原生 loading=&quot;lazy&quot;（native 模式）</h3>
        <p>
          浏览器原生支持的图片懒加载，零 JS 代码，浏览器自行决定加载时机。
        </p>
        <pre>
          <code>{`<img
  src="photo.jpg"
  loading="lazy"
  width="800"
  height="600"
  alt="..."
/>`}</code>
        </pre>
        <div className="note">
          注意：原生 lazy 的预加载距离由浏览器决定，开发者无法精确控制；
          且需同时设置 <code>width</code> / <code>height</code> 防止布局抖动（CLS）。
        </div>

        <h3>3. 立即加载（eager 模式 / 对照组）</h3>
        <p>
          所有图片在页面加载时立刻发起请求，可观察到明显的带宽争抢与首屏卡顿。
          适用于关键首屏图片（如 LCP 元素）。
        </p>

        <h3>选择建议</h3>
        <ul>
          <li>首屏 LCP 图片：使用 <code>loading=&quot;eager&quot;</code> + <code>fetchpriority=&quot;high&quot;</code></li>
          <li>普通列表/图库：使用 <code>loading=&quot;lazy&quot;</code> 即可，最简单</li>
          <li>需要精细控制（埋点、骨架屏、动画）：使用 IntersectionObserver</li>
          <li>可结合：首屏 eager + 其余 lazy，兼顾首屏与带宽</li>
        </ul>
      </section>
    </div>
  )
}
