import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * 节流 Hook - 值版本
 *
 * 限制值更新的频率，每隔 limit 毫秒最多更新一次。
 * 适用于滚动事件、resize 事件等需要持续响应但不需要每次都触发的情况。
 *
 * @param value 需要节流的值
 * @param limit 节流时间间隔（毫秒）
 * @returns 节流后的值
 *
 * @example
 * const [scrollY, setScrollY] = useState(0)
 * const throttledScrollY = useThrottle(scrollY, 200)
 */
export function useThrottle<T>(value: T, limit: number = 200): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecutedRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastExecutedRef.current

    if (elapsed >= limit) {
      // 超过节流间隔，立即更新
      lastExecutedRef.current = now
      setThrottledValue(value)
    } else {
      // 在节流间隔内，设置定时器在剩余时间后更新
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        lastExecutedRef.current = Date.now()
        setThrottledValue(value)
      }, limit - elapsed)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * 节流回调 Hook
 *
 * 返回一个节流后的回调函数，每隔 limit 毫秒最多执行一次。
 *
 * @param callback 需要节流的回调函数
 * @param limit 节流时间间隔（毫秒）
 * @returns 节流后的回调函数
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  limit: number = 200
): T {
  const lastExecutedRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const throttledFn = useCallback(
    (...args: any[]) => {
      const now = Date.now()
      const elapsed = now - lastExecutedRef.current

      if (elapsed >= limit) {
        lastExecutedRef.current = now
        callbackRef.current(...args)
      } else {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          lastExecutedRef.current = Date.now()
          callbackRef.current(...args)
        }, limit - elapsed)
      }
    },
    [limit]
  ) as T

  return throttledFn
}
