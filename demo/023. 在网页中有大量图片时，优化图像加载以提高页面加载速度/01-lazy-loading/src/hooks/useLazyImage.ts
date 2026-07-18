import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useIntersectionLazy
 * 基于 IntersectionObserver 的图片懒加载 hook
 *
 * 工作原理：
 * 1. 组件挂载时并不立即设置 img.src，仅用 data-src 占位
 * 2. 观察元素与视口的交叉状态，进入视口（rootMargin 提前预触发）后返回 true
 * 3. 返回 true 后由调用方把 data-src 写入 src，触发真正的图片请求
 *
 * 相比原生 loading="lazy" 的优势：
 * - 可自定义 rootMargin（提前 N 像素预加载，体验更顺滑）
 * - 可自定义 threshold
 * - 可与业务逻辑（埋点、动画、骨架屏切换）解耦组合
 * - 兼容性更可控（不支持时降级为立即加载）
 */
export function useIntersectionLazy(options?: {
  rootMargin?: string
  threshold?: number
  once?: boolean
}) {
  const { rootMargin = '200px 0px', threshold = 0.01, once = true } = options || {}
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 降级：浏览器不支持 IntersectionObserver 时直接可见
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, visible }
}

/**
 * useImageLoadStats
 * 统计图片加载完成数与失败数
 */
export function useImageLoadStats(total: number) {
  const [loadedCount, setLoadedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [requestedCount, setRequestedCount] = useState(0)

  const markRequested = useCallback(() => {
    setRequestedCount((c) => c + 1)
  }, [])

  const markLoaded = useCallback(() => {
    setLoadedCount((c) => c + 1)
  }, [])

  const markFailed = useCallback(() => {
    setFailedCount((c) => c + 1)
  }, [])

  const reset = useCallback(() => {
    setLoadedCount(0)
    setFailedCount(0)
    setRequestedCount(0)
  }, [])

  return {
    total,
    loadedCount,
    failedCount,
    requestedCount,
    markRequested,
    markLoaded,
    markFailed,
    reset,
  }
}
