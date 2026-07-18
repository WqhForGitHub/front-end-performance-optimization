import { useEffect, useRef, useState, useCallback } from 'react'

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

interface UseProgressiveImageOptions {
  /** 低质量占位图（LQIP）URL，通常是非常小尺寸（如 20px 宽） */
  placeholderSrc: string
  /** 主图 URL */
  src: string
  /** 是否启用懒加载（仅当进入视口时才开始加载主图） */
  lazy?: boolean
  /** rootMargin，仅 lazy=true 时生效 */
  rootMargin?: string
}

/**
 * useProgressiveImage
 * 渐进式图片加载 hook：
 * 1. placeholderSrc 是极小的 LQIP（低质量占位图），通常只有几百字节，瞬间加载完成
 * 2. 主图通过 new Image() 预加载，加载完成后触发 onLoad 切换状态
 * 3. 可选懒加载：主图仅在元素进入视口时才开始加载（IntersectionObserver）
 *
 * 返回：
 * - state: 'idle' | 'loading' | 'loaded' | 'error'
 * - ref: 绑定到容器元素的 ref（用于懒加载观察）
 * - placeholderReady: 占位图是否已就绪（恒为 true，因 LQIP 极小）
 * - mainReady: 主图是否加载完成
 */
export function useProgressiveImage(options: UseProgressiveImageOptions) {
  const { placeholderSrc, src, lazy = false, rootMargin = '200px 0px' } = options
  const [state, setState] = useState<LoadState>('idle')
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState<boolean>(!lazy)

  // 懒加载：观察元素是否进入视口
  useEffect(() => {
    if (!lazy) {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin, threshold: 0.01 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [lazy, rootMargin])

  // 主图预加载：进入视口后开始
  useEffect(() => {
    if (!inView) return
    if (!src) return

    setState('loading')
    let cancelled = false
    const img = new Image()
    img.src = src

    const handleLoad = () => {
      if (cancelled) return
      setState('loaded')
    }
    const handleError = () => {
      if (cancelled) return
      setState('error')
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    // 若图片已缓存，可能 load 事件已触发，补充判断
    if (img.complete) {
      handleLoad()
    }

    return () => {
      cancelled = true
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [inView, src])

  const reload = useCallback(() => {
    setState('idle')
    // 触发重新加载：通过重置 inView -> true + 改变 src 引用
    if (inView) {
      setState('loading')
      const img = new Image()
      img.src = src
      img.addEventListener('load', () => setState('loaded'))
      img.addEventListener('error', () => setState('error'))
    }
  }, [inView, src])

  return {
    ref,
    state,
    placeholderSrc,
    mainReady: state === 'loaded',
    inView,
    reload,
  }
}
