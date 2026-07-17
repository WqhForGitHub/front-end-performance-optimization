import { useState, CSSProperties } from 'react'
import { buildPicUrl } from '../data/images'

interface PictureArtDirectionProps {
  seed: string
  alt: string
}

/**
 * PictureArtDirection
 * 演示 <picture> 元素的艺术指导（Art Direction）：
 * - 大屏使用宽幅 16:9 构图
 * - 中屏使用 4:3 构图
 * - 小屏使用 1:1 裁切，突出主体
 *
 * 与 srcset 的区别：srcset 是同一张图的不同分辨率，
 * 而 <picture> + <source media> 可以在不同视口下选用完全不同的裁切/构图。
 */
export function PictureArtDirection({ seed, alt }: PictureArtDirectionProps) {
  const [loaded, setLoaded] = useState(false)

  // 三种裁切：宽屏 16:9 / 平板 4:3 / 手机 1:1
  const wideSrc = buildPicUrl(seed, 1600, 16 / 9)
  const tabletSrc = buildPicUrl(seed, 800, 4 / 3)
  const mobileSrc = buildPicUrl(seed, 600, 1)
  const fallbackSrc = buildPicUrl(seed, 800, 4 / 3)

  const wrapperStyle: CSSProperties = {
    aspectRatio: '4 / 3'
  }

  return (
    <div className="responsive-card">
      <div className="responsive-media" style={wrapperStyle}>
        <div className={`placeholder ${loaded ? 'hidden' : ''}`}>加载中...</div>
        <picture>
          {/* 宽屏：>= 1024px 使用 16:9 构图 */}
          <source
            media="(min-width: 1024px)"
            srcSet={wideSrc}
          />
          {/* 平板：640px ~ 1023px 使用 4:3 构图 */}
          <source
            media="(min-width: 640px)"
            srcSet={tabletSrc}
          />
          {/* 手机：< 640px 使用 1:1 裁切，突出主体 */}
          <source
            media="(max-width: 639px)"
            srcSet={mobileSrc}
          />
          <img
            src={fallbackSrc}
            alt={alt}
            loading="lazy"
            className={loaded ? 'loaded' : ''}
            onLoad={() => setLoaded(true)}
          />
        </picture>
      </div>
      <div className="responsive-meta">
        <div className="meta-row">
          <span className="meta-label">宽屏 (≥1024px)</span>
          <code>16:9 / 1600×900</code>
        </div>
        <div className="meta-row">
          <span className="meta-label">平板 (640~1023px)</span>
          <code>4:3 / 800×600</code>
        </div>
        <div className="meta-row">
          <span className="meta-label">手机 (&lt;640px)</span>
          <code>1:1 / 600×600</code>
        </div>
        <div className="meta-note">
          缩放浏览器窗口可见图片构图变化（艺术指导），不只是分辨率变化。
        </div>
      </div>
    </div>
  )
}
