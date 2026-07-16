import { useState } from 'react'
import { useLazyLoad } from '../hooks/useLazyLoad'

interface LazyImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  placeholder?: string
}

/**
 * 懒加载图片组件
 *
 * 使用 IntersectionObserver 检测元素是否进入视口，
 * 只有进入视口后才加载真实图片，减少不必要的网络请求。
 *
 * 特性：
 * 1. 进入视口前显示骨架屏占位符
 * 2. 图片加载过程中显示加载动画
 * 3. 图片加载完成后淡入显示
 */
export default function LazyImage({
  src,
  alt,
  width = '100%',
  height = 220,
  placeholder,
}: LazyImageProps) {
  const { targetRef, isVisible } = useLazyLoad<HTMLDivElement>()
  const [loaded, setLoaded] = useState(false)

  const containerStyle: Record<string, string | number | undefined> = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
  }

  const skeletonStyle: Record<string, string | number | undefined> = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '14px',
    background:
      'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    transition: 'opacity 0.3s ease',
    opacity: loaded ? '0' : '1',
  }

  const imgStyle: Record<string, string | number | undefined> = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: loaded ? '1' : '0',
    transition: 'opacity 0.3s ease',
  }

  return (
    <div ref={targetRef} style={containerStyle}>
      {(!isVisible || !loaded) && (
        <div style={skeletonStyle}>
          {isVisible ? '加载中...' : (placeholder ?? '等待加载')}
        </div>
      )}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  )
}
