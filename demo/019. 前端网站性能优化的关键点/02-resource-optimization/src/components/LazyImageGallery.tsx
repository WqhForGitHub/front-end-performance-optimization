import { useEffect, useRef, useState, CSSProperties } from 'react'

interface LazyImageGalleryProps {}

/** 生成一个带颜色的 SVG 占位图 Data URI */
function makePlaceholder(seed: number, label: string): string {
  const hues = [210, 270, 30, 120, 340, 60, 180, 0]
  const hue = hues[seed % hues.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
    <rect width="300" height="200" fill="hsl(${hue}, 60%, 80%)" />
    <rect width="300" height="200" fill="url(#g)" opacity="0.3" />
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue}, 70%, 60%)" />
        <stop offset="100%" stop-color="hsl(${(hue + 40) % 360}, 70%, 50%)" />
      </linearGradient>
    </defs>
    <text x="150" y="100" font-family="sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="bold">${label}</text>
    <text x="150" y="125" font-family="sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.8">image-${seed}.svg</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const imageSeeds = Array.from({ length: 12 }, (_, i) => ({
  seed: i,
  src: makePlaceholder(i, `图片 ${i + 1}`),
}))

/**
 * 懒加载图片画廊：
 * - 左侧：eager（立即加载全部）
 * - 右侧：lazy（loading="lazy"，进入视口才加载）
 * - 通过 IntersectionObserver 统计「已加载图片数」对比
 */
export default function LazyImageGallery(_: LazyImageGalleryProps) {
  const [eagerLoaded, setEagerLoaded] = useState(0)
  const [lazyLoaded, setLazyLoaded] = useState(0)
  const lazyContainerRef = useRef<HTMLDivElement | null>(null)

  // eager 模式：挂载即认为全部开始加载
  useEffect(() => {
    setEagerLoaded(imageSeeds.length)
  }, [])

  // lazy 模式：使用 IntersectionObserver 统计实际进入视口的图片
  useEffect(() => {
    const container = lazyContainerRef.current
    if (!container || typeof IntersectionObserver === 'undefined') {
      setLazyLoaded(imageSeeds.length)
      return
    }
    const imgs = Array.from(container.querySelectorAll('img[data-lazy="1"]'))
    let count = 0
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            count += 1
            setLazyLoaded(count)
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' },
    )
    imgs.forEach((img) => observer.observe(img))
    return () => observer.disconnect()
  }, [])

  const wrapperStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  const titleStyle: CSSProperties = {
    margin: '0 0 8px 0',
    fontSize: '17px',
    fontWeight: 700,
    color: '#333',
  }

  const descStyle: CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  }

  const panelStyle = (color: string): CSSProperties => ({
    border: `2px solid ${color}33`,
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: `${color}08`,
  })

  const panelHeaderStyle = (color: string): CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '13px',
    color,
    fontWeight: 700,
  })

  const countStyle: CSSProperties = {
    fontSize: '12px',
    color: '#999',
  }

  const imgGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '4px',
    display: 'block',
    backgroundColor: '#eee',
  }

  const scrollHintStyle: CSSProperties = {
    fontSize: '11px',
    color: '#999',
    marginTop: '8px',
    textAlign: 'center',
  }

  const scrollBoxStyle: CSSProperties = {
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '4px',
  }

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>图片懒加载对比（loading="lazy"）</h3>
      <p style={descStyle}>
        左侧使用默认的 eager 加载，进入页面即下载全部 12 张图；右侧使用{' '}
        <code style={{ backgroundColor: '#f0f0f0', padding: '1px 5px', borderRadius: '3px' }}>loading="lazy"</code>
        ，仅当图片滚动进入视口附近时才下载。向下滚动右侧区域，观察「已加载」计数的变化。
      </p>
      <div style={gridStyle}>
        <div style={panelStyle('#f44336')}>
          <div style={panelHeaderStyle('#f44336')}>
            <span>Eager（立即加载）</span>
            <span style={countStyle}>已加载 {eagerLoaded} / {imageSeeds.length}</span>
          </div>
          <div style={imgGridStyle}>
            {imageSeeds.map((img) => (
              <img key={`e-${img.seed}`} src={img.src} alt={`eager-${img.seed}`} style={imgStyle} />
            ))}
          </div>
        </div>

        <div style={panelStyle('#4caf50')}>
          <div style={panelHeaderStyle('#4caf50')}>
            <span>Lazy（懒加载）</span>
            <span style={countStyle}>已加载 {lazyLoaded} / {imageSeeds.length}</span>
          </div>
          <div style={scrollBoxStyle} ref={lazyContainerRef}>
            <div style={imgGridStyle}>
              {imageSeeds.map((img) => (
                <img
                  key={`l-${img.seed}`}
                  src={img.src}
                  alt={`lazy-${img.seed}`}
                  style={imgStyle}
                  loading="lazy"
                  data-lazy="1"
                />
              ))}
            </div>
          </div>
          <div style={scrollHintStyle}>{'->'} 在此区域内滚动以触发懒加载</div>
        </div>
      </div>
    </div>
  )
}
