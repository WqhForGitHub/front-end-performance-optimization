import { useState, CSSProperties } from 'react'
import { useProgressiveImage, LoadState } from '../hooks/useProgressiveImage'

interface ProgressiveImageProps {
  /** React 列表 key（fallback 类型不自动剥离 key，需显式声明） */
  key?: string | number
  /** 低质量占位图 URL（建议 20~40px 宽，体积几 KB 内） */
  placeholderSrc: string
  /** 主图 URL */
  src: string
  alt: string
  /** 宽高比，防止布局抖动 */
  aspect?: number
  /** 是否启用懒加载 */
  lazy?: boolean
  /** 显示状态标签 */
  showState?: boolean
}

const STATE_TEXT: Record<LoadState, string> = {
  idle: '等待中',
  loading: '加载主图...',
  loaded: '主图已加载',
  error: '加载失败',
}

/**
 * ProgressiveImage
 * 渐进式图片加载（LQIP + blur-up）：
 * 1. 立即显示极小的 LQIP 占位图（被 CSS 放大并模糊）
 * 2. 主图在后台异步加载
 * 3. 主图加载完成后，淡入覆盖在 LQIP 之上，LQIP 淡出
 *
 * 视觉上呈现"先模糊后清晰"的过渡，避免长时间白屏，提升感知性能。
 */
export function ProgressiveImage({
  placeholderSrc,
  src,
  alt,
  aspect = 4 / 3,
  lazy = true,
  showState = true,
}: ProgressiveImageProps) {
  const { ref, state, mainReady } = useProgressiveImage({
    placeholderSrc,
    src,
    lazy,
  })
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false)

  const wrapperStyle: CSSProperties = {
    aspectRatio: `${aspect}`,
  }

  const stateClass = state

  return (
    <div className="progressive-card" ref={ref}>
      <div className="progressive-media" style={wrapperStyle}>
        {/* LQIP 占位层：被放大并模糊，加载完成前始终可见 */}
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={`lqip ${placeholderLoaded ? 'ready' : ''} ${mainReady ? 'faded' : ''}`}
          onLoad={() => setPlaceholderLoaded(true)}
        />
        {/* 主图层：加载完成后淡入覆盖在 LQIP 之上 */}
        {mainReady && <img src={src} alt={alt} className="main-image loaded" />}
        {/* 状态徽章 */}
        {showState && <div className={`state-badge ${stateClass}`}>{STATE_TEXT[state]}</div>}
        {/* 加载失败时显示错误层 */}
        {state === 'error' && <div className="error-overlay">图片加载失败</div>}
      </div>
    </div>
  )
}
