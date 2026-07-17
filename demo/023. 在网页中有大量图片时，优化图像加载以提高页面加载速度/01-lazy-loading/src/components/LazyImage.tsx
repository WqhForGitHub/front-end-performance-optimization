import { useState, useCallback, useEffect, CSSProperties } from 'react'
import { useIntersectionLazy } from '../hooks/useLazyImage'

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  /** 使用 IntersectionObserver 还是原生 loading="lazy" */
  mode: 'io' | 'native' | 'eager'
  /** 进入视口前提前多少像素预加载 */
  rootMargin?: string
  onRequested?: () => void
  onLoaded?: () => void
  onError?: () => void
}

/**
 * LazyImage
 * 统一封装三种加载模式：
 * - io:     IntersectionObserver 控制，未进入视口前不请求图片
 * - native: 使用浏览器原生 loading="lazy"，浏览器自行决定加载时机
 * - eager:  立即加载（对照组），用于演示不优化时的带宽争抢
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  mode,
  rootMargin = '200px 0px',
  onRequested,
  onLoaded,
  onError
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const { ref, visible } = useIntersectionLazy({ rootMargin, once: true })

  // IO 模式：进入视口才设置 src
  const shouldLoad = mode === 'io' ? visible : true
  const actualSrc = shouldLoad ? src : undefined
  const nativeLoading = mode === 'native' ? 'lazy' : mode === 'eager' ? 'eager' : undefined

  // 真正发起请求时（src 被设置）通知父组件
  useEffect(() => {
    if (shouldLoad) {
      onRequested?.()
    }
    // 仅依赖 shouldLoad 的切换
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad])

  const handleLoad = useCallback(() => {
    setLoaded(true)
    onLoaded?.()
  }, [onLoaded])

  const handleError = useCallback(() => {
    setError(true)
    setLoaded(true)
    onError?.()
  }, [onError])

  const wrapperStyle: CSSProperties = {
    aspectRatio: `${width} / ${height}`
  }

  return (
    <div className="gallery-item" ref={ref} style={wrapperStyle}>
      <span className={`tag ${mode === 'io' ? 'io' : mode === 'native' ? 'native' : 'eager'}`}>
        {mode === 'io' ? 'IO 懒加载' : mode === 'native' ? '原生 lazy' : '立即加载'}
      </span>
      <div className={`placeholder ${loaded ? 'hidden' : ''}`}>
        {error ? '加载失败' : '加载中...'}
      </div>
      {actualSrc && (
        <img
          src={actualSrc}
          alt={alt}
          width={width}
          height={height}
          loading={nativeLoading}
          className={loaded ? 'loaded' : ''}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
