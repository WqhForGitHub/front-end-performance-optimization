import { useCallback, useRef } from 'react'

/**
 * 使用 requestAnimationFrame 进行节流的 Hook
 * 把高频回调对齐到浏览器的刷新帧（约 16.67ms/帧），保证：
 * 1. 每帧最多执行一次，避免无意义的重复渲染
 * 2. 与屏幕刷新同步，动画流畅且不丢帧
 */
export function useRafThrottle<T extends (...args: any[]) => void>(callback: T): T {
  const rafIdRef = useRef<number | null>(null)
  const callbackRef = useRef<T>(callback)
  callbackRef.current = callback

  const throttled = useCallback((...args: any[]) => {
    if (rafIdRef.current !== null) return
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null
      callbackRef.current(...args)
    })
  }, []) as T

  return throttled
}
