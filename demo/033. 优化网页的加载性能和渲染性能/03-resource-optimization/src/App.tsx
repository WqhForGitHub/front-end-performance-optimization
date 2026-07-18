import type { FC, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

// ============================================================================
// 卡片容器
// ============================================================================

const Card: FC<{ title: string; badge?: string; children: ReactNode }> = ({
  title,
  badge,
  children,
}) => (
  <section className="section">
    <h2>
      {title}
      {badge ? <span className="badge">{badge}</span> : null}
    </h2>
    {children}
  </section>
)

// ============================================================================
// 1) 图片懒加载演示
// 使用原生 loading="lazy" + IntersectionObserver 自定义懒加载
// ============================================================================

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
}

/** 基于 IntersectionObserver 的懒加载图片 */
const LazyImage: FC<LazyImageProps> = ({ src, alt, width, height }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height }}>
      {inView ? (
        loaded ? (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 6,
              display: 'block',
            }}
          />
        ) : (
          <div className="placeholder" style={{ height: '100%', borderRadius: 6 }} />
        )
      ) : (
        <div className="placeholder" style={{ height: '100%', borderRadius: 6 }} />
      )}
      {inView && !loaded ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          style={{ display: 'none' }}
        />
      ) : null}
    </div>
  )
}

// ============================================================================
// 2) 响应式图片 srcset 演示
// ============================================================================

const ResponsiveImageDemo: FC = () => {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
        浏览器根据视口宽度/DPR 自动选择最合适的图片尺寸，节省带宽：
      </div>
      <img
        src="https://picsum.photos/seed/responsive/1200/400"
        alt="响应式图片示例"
        srcSet="https://picsum.photos/seed/responsive/400/133 400w, https://picsum.photos/seed/responsive/800/267 800w, https://picsum.photos/seed/responsive/1200/400 1200w"
        sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
        style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }}
      />
      <div className="stat" style={{ marginTop: 6 }}>
        srcSet 提供 400w / 800w / 1200w 三个版本，sizes 声明不同断点使用哪个
      </div>
    </div>
  )
}

// ============================================================================
// 3) 瀑布图数据
// ============================================================================

interface WaterfallRow {
  name: string
  wait: number // 等待时间百分比
  transfer: number // 传输时间百分比
  size: string
  cls: 'good' | 'bad' | ''
}

const badWaterfall: WaterfallRow[] = [
  { name: 'index.html', wait: 0, transfer: 18, size: '8 KB', cls: 'bad' },
  { name: 'main.js (无压缩)', wait: 5, transfer: 95, size: '580 KB', cls: 'bad' },
  { name: 'main.css', wait: 8, transfer: 35, size: '120 KB', cls: 'bad' },
  { name: 'hero.png (1MB)', wait: 12, transfer: 88, size: '1.0 MB', cls: 'bad' },
  { name: 'gallery-1.jpg', wait: 15, transfer: 60, size: '450 KB', cls: 'bad' },
  { name: 'gallery-2.jpg', wait: 18, transfer: 65, size: '470 KB', cls: 'bad' },
  { name: 'gallery-3.jpg', wait: 20, transfer: 62, size: '460 KB', cls: 'bad' },
  { name: 'font.woff2', wait: 30, transfer: 20, size: '90 KB', cls: 'bad' },
]

const goodWaterfall: WaterfallRow[] = [
  { name: 'index.html', wait: 0, transfer: 6, size: '6 KB', cls: 'good' },
  { name: 'main.js (gzip)', wait: 2, transfer: 22, size: '120 KB', cls: 'good' },
  { name: 'main.css (gzip)', wait: 4, transfer: 8, size: '18 KB', cls: 'good' },
  { name: 'hero.webp', wait: 6, transfer: 28, size: '90 KB', cls: 'good' },
  { name: 'gallery-1.webp (CDN)', wait: 7, transfer: 12, size: '40 KB', cls: 'good' },
  { name: 'gallery-2.webp (CDN)', wait: 8, transfer: 12, size: '42 KB', cls: 'good' },
  { name: 'gallery-3.webp (CDN)', wait: 9, transfer: 12, size: '41 KB', cls: 'good' },
  { name: 'font.woff2 (preload)', wait: 0, transfer: 8, size: '60 KB', cls: 'good' },
]

const Waterfall: FC<{ rows: WaterfallRow[] }> = ({ rows }) => (
  <div className="waterfall">
    {rows.map((row) => (
      <div className="waterfall-row" key={row.name}>
        <span
          style={{
            color: '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.name}
        </span>
        <div className={'bar ' + row.cls}>
          <div className="wait" style={{ width: row.wait + '%' }} />
          <div className="transfer" style={{ left: row.wait + '%', width: row.transfer + '%' }} />
        </div>
        <span style={{ color: '#64748b', textAlign: 'right' }}>{row.size}</span>
      </div>
    ))}
  </div>
)

// ============================================================================
// 4) 压缩对比数据
// ============================================================================

const compressRows = [
  { name: 'JS 原始', size: 580, kb: '580 KB', cls: 'bad' },
  { name: 'JS gzip', size: 180, kb: '180 KB', cls: 'warn' },
  { name: 'JS brotli', size: 120, kb: '120 KB', cls: 'good' },
  { name: 'CSS 原始', size: 120, kb: '120 KB', cls: 'bad' },
  { name: 'CSS gzip', size: 28, kb: '28 KB', cls: 'warn' },
  { name: 'CSS brotli', size: 18, kb: '18 KB', cls: 'good' },
  { name: 'PNG', size: 850, kb: '850 KB', cls: 'bad' },
  { name: 'WebP', size: 180, kb: '180 KB', cls: 'good' },
  { name: 'AVIF', size: 95, kb: '95 KB', cls: 'good' },
]

// ============================================================================
// 代码片段
// ============================================================================

const lazyImgCode = `<!-- 1. 原生懒加载：loading="lazy" -->
<img src="hero.jpg" loading="lazy"
     width="800" height="600" alt="..." />

<!-- 2. 响应式图片：srcset + sizes -->
<img srcset="photo-400w.jpg 400w,
             photo-800w.jpg 800w,
             photo-1200w.jpg 1200w"
     sizes="(max-width: 600px) 400px,
            (max-width: 900px) 800px,
            1200px"
     src="photo-800w.jpg" alt="..." />`

const cacheCode = `# nginx 缓存配置示例
# 静态资源: 强缓存 1 年（带 hash 文件名）
location ~* \\.(js|css|png|jpg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML: 协商缓存
location ~* \\.html$ {
  add_header Cache-Control "no-cache";
}

# Server-Timing / ETag 协商
etag on;`

const cdnCode = `// CDN 使用：静态资源走 CDN 边缘节点
<img src="https://cdn.example.com/img/hero.webp" />

// <link rel="preconnect"> 提前建立连接
<link rel="preconnect" href="https://cdn.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />`

const compressCode = `# nginx 开启 gzip / brotli 压缩
gzip on;
gzip_types text/css application/javascript application/json
           image/svg+xml;
gzip_min_length 1024;

# brotli (比 gzip 多压缩 15-25%)
brotli on;
brotli_types text/css application/javascript image/svg+xml;`

const App: FC = () => {
  const [tab, setTab] = useState<'lazy' | 'cache' | 'cdn' | 'compress'>('lazy')

  // 演示用图片列表（使用 picsum 占位图）
  const images = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        src: 'https://picsum.photos/seed/lazy-' + i + '/320/240',
        alt: '懒加载示例图 ' + (i + 1),
      })),
    [],
  )

  const totalBad = useMemo(() => badWaterfall.reduce((s, r) => s + r.transfer, 0), [])
  const totalGood = useMemo(() => goodWaterfall.reduce((s, r) => s + r.transfer, 0), [])

  return (
    <div className="app">
      <header className="header">
        <h1>03 资源优化 (Resource Optimization)</h1>
        <p>
          通过图片懒加载、响应式图片、CDN 加速、HTTP 缓存、gzip/brotli 压缩等手段，
          降低资源体积与传输耗时。端口: 5272
        </p>
      </header>

      <Card title="策略总览" badge="overview">
        <ul className="list">
          <li>
            <strong>图片懒加载</strong>: loading="lazy" / IntersectionObserver，可视区外不下载
          </li>
          <li>
            <strong>响应式图片</strong>: srcset + sizes，按视口宽度选择合适尺寸
          </li>
          <li>
            <strong>现代图片格式</strong>: WebP / AVIF 比 PNG/JPEG 小 30%-80%
          </li>
          <li>
            <strong>CDN 加速</strong>: 边缘节点就近分发，配合 preconnect / dns-prefetch
          </li>
          <li>
            <strong>HTTP 缓存</strong>: 强缓存 (max-age + immutable) + 协商缓存 (ETag)
          </li>
          <li>
            <strong>压缩传输</strong>: gzip / brotli 压缩文本资源，brotli 多省 15-25%
          </li>
          <li>
            <strong>资源预连接</strong>: preconnect / dns-prefetch 提前建立 TCP/TLS
          </li>
          <li>
            <strong>HTTP/2 多路复用</strong>: 单连接并行下载，消除队头阻塞
          </li>
        </ul>
      </Card>

      <Card title="图片懒加载演示" badge="lazy load">
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
          滚动下方网格，进入视口的图片才会真正加载（IntersectionObserver + 原生 loading="lazy"
          双保险）：
        </div>
        <div className="image-grid">
          {images.map((img) => (
            <LazyImage key={img.id} src={img.src} alt={img.alt} width={160} height={120} />
          ))}
        </div>
        <div className="note">
          首屏只加载可视区内的 3-4 张图片，其余在滚动进入视口时再加载，节省 70%+ 初始请求。
        </div>
      </Card>

      <Card title="响应式图片 srcset" badge="responsive">
        <ResponsiveImageDemo />
      </Card>

      <Card title="资源加载瀑布图对比" badge="waterfall">
        <div className="compare">
          <div className="col">
            <h4>
              <span className="tag red">优化前</span> 大资源串行加载
            </h4>
            <Waterfall rows={badWaterfall} />
            <div className="stat">总传输时间: ~{Math.round(totalBad / 8)}ms，3.2 MB</div>
          </div>
          <div className="col">
            <h4>
              <span className="tag green">优化后</span> 压缩 + CDN 并行
            </h4>
            <Waterfall rows={goodWaterfall} />
            <div className="stat">总传输时间: ~{Math.round(totalGood / 8)}ms，449 KB (-86%)</div>
          </div>
        </div>
      </Card>

      <Card title="压缩格式对比" badge="compression">
        <div className="compress-chart">
          {compressRows.map((r) => (
            <div className="compress-row" key={r.name}>
              <span style={{ color: '#475569' }}>{r.name}</span>
              <div className={'bar ' + r.cls} style={{ width: (r.size / 580) * 100 + '%' }}>
                <div className="transfer" style={{ left: 0, width: '100%' }} />
              </div>
              <span style={{ color: '#64748b', textAlign: 'right' }}>{r.kb}</span>
            </div>
          ))}
        </div>
        <div className="note">brotli 比 gzip 多压缩 15-25%；WebP/AVIF 比 PNG 小 60-80%。</div>
      </Card>

      <Card title="缓存策略说明" badge="cache">
        <table className="cache-table">
          <thead>
            <tr>
              <th>资源类型</th>
              <th>策略</th>
              <th>Cache-Control</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>带 hash 的 JS/CSS</td>
              <td>
                <span className="tag green">强缓存</span>
              </td>
              <td>
                <code>max-age=31536000, immutable</code>
              </td>
              <td>1 年，文件名变化即新 URL</td>
            </tr>
            <tr>
              <td>HTML 文档</td>
              <td>
                <span className="tag amber">协商缓存</span>
              </td>
              <td>
                <code>no-cache</code>
              </td>
              <td>每次校验 ETag/Last-Modified</td>
            </tr>
            <tr>
              <td>字体 / 图片</td>
              <td>
                <span className="tag green">强缓存</span>
              </td>
              <td>
                <code>max-age=31536000</code>
              </td>
              <td>1 年，版本通过 URL hash 控制</td>
            </tr>
            <tr>
              <td>API 接口</td>
              <td>
                <span className="tag blue">短缓存</span>
              </td>
              <td>
                <code>max-age=60, stale-while-revalidate=600</code>
              </td>
              <td>短缓存 + 后台异步更新</td>
            </tr>
            <tr>
              <td>用户敏感数据</td>
              <td>
                <span className="tag red">不缓存</span>
              </td>
              <td>
                <code>no-store</code>
              </td>
              <td>完全不缓存</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card title="代码示例" badge="code">
        <div className="row" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
          {(
            [
              ['lazy', '图片懒加载'],
              ['cache', '缓存配置'],
              ['cdn', 'CDN 使用'],
              ['compress', '压缩配置'],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              className={'btn outline'}
              style={
                tab === t ? { background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' } : {}
              }
              onClick={() => setTab(t)}
            >
              {label}
            </button>
          ))}
        </div>
        <pre className="code">
          {tab === 'lazy'
            ? lazyImgCode
            : tab === 'cache'
              ? cacheCode
              : tab === 'cdn'
                ? cdnCode
                : compressCode}
        </pre>
      </Card>
    </div>
  )
}

export default App
