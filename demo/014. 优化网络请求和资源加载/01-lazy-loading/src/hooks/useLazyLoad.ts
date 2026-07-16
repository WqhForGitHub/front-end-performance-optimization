import { useState, useRef, useEffect } from 'react'

interface UseLazyLoadOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

/**
 * 使用 IntersectionObserver 实现懒加载 Hook
 *
 * 当目标元素进入视口时，返回 isVisible = true
 * 只触发一次，触发后自动断开观察
 *
 * @example
 * const { targetRef, isVisible } = useLazyLoad<HTMLDivElement>()
 * return <div ref={targetRef}>{isVisible && <img src="..." />}</div>
 */
export function useLazyLoad<T extends HTMLElement>(options?: UseLazyLoadOptions) {
  const targetRef = useRef<T>()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    // 如果浏览器不支持 IntersectionObserver，直接显示
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // 只需触发一次，触发后断开观察
            observer.disconnect()
          }
        })
      },
      {
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '100px',
        threshold: options?.threshold ?? 0,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options?.root, options?.rootMargin, options?.threshold])

  return { targetRef, isVisible }
}
