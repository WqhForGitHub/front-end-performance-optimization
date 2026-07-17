import { useState, CSSProperties } from 'react'
import { buildPicUrl, buildSrcset } from '../data/images'

interface ResponsiveImageProps {
  /** React 列表 key（fallback 类型不自动剥离 key，需显式声明） */
  key?: string | number
  seed: string
  alt: string
  widths: number[]
  aspect: number
  /** sizes 属性，告诉浏览器图片在不同视口下的显示宽度 */
  sizes?: string
}

/**
 * ResponsiveImage
 * 演示使用 srcset + sizes 实现响应式图片：
 * - srcset 提供同一图片的多个分辨率版本
 * - sizes 描述图片在视口中占用的宽度，浏览器据此选择最合适的源
 * - 浏览器只下载实际需要的那一张，节省带宽
 */
export function ResponsiveImage({
  seed,
  alt,
  widths,
  aspect,
  sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false)
  // 默认 src 使用中等宽度，作为不支持 srcset 的浏览器降级
  const defaultWidth = widths[Math.floor(widths.length / 2)] || 800
  const srcset = buildSrcset(seed, widths, aspect)
  const defaultSrc = buildPicUrl(seed, defaultWidth, aspect)

  const wrapperStyle: CSSProperties = {
    aspectRatio: `${aspect}`
  }

  return (
    <div className="responsive-card">
      <div className="responsive-media" style={wrapperStyle}>
        <div className={`placeholder ${loaded ? 'hidden' : ''}`}>加载中...</div>
        <img
          src={defaultSrc}
          srcSet={srcset}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          className={loaded ? 'loaded' : ''}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="responsive-meta">
        <div className="meta-row">
          <span className="meta-label">srcset</span>
          <code>{widths.length} 个宽度版本</code>
        </div>
        <div className="meta-row">
          <span className="meta-label">sizes</span>
          <code className="meta-code">{sizes}</code>
        </div>
        <div className="meta-row">
          <span className="meta-label">当前实际下载</span>
          <span className="meta-value">
            {loaded ? '见网络面板 (Network → Img)' : '等待加载...'}
          </span>
        </div>
      </div>
    </div>
  )
}
