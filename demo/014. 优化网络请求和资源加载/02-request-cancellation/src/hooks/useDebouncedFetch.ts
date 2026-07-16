import { useState, useEffect, useRef, useCallback } from 'react'

interface DebouncedFetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * 防抖请求 Hook
 *
 * 核心优化点：
 * 1. 用户输入后等待 delay 毫秒才发起请求
 * 2. 在等待期间如果用户继续输入，取消上一个待发请求
 * 3. 如果请求已发出但未完成，用 AbortController 取消
 *
 * 这样可以避免用户快速输入时发送大量无用请求。
 *
 * @example
 * const { data, loading } = useDebouncedFetch(searchTerm, 500)
 */
export function useDebouncedFetch<T = unknown>(
  query: string,
  delay: number = 500
): DebouncedFetchState<T> & { cancelCount: number } {
  const [state, setState] = useState<DebouncedFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  const [cancelCount, setCancelCount] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const performFetch = useCallback(
    (searchQuery: string) => {
      // 取消上一个进行中的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        setCancelCount((n) => n + 1)
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setState((prev) => ({ ...prev, loading: true, error: null }))

      // 模拟 API 请求
      const mockUrl = `https://jsonplaceholder.typicode.com/users?q=${encodeURIComponent(searchQuery)}`

      fetch(mockUrl, { signal: controller.signal })
        .then((res) => res.json() as Promise<T>)
        .then((data) => {
          if (!controller.signal.aborted) {
            setState({ data, loading: false, error: null })
          }
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return
          if (!controller.signal.aborted) {
            setState({ data: null, loading: false, error: err })
          }
        })
    },
    []
  )

  useEffect(() => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null })
      return
    }

    // 清除上一个防抖定时器（取消待发请求）
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      setCancelCount((n) => n + 1)
    }

    // 设置新的防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      performFetch(query)
    }, delay)

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, delay, performFetch])

  // 组件卸载时取消所有请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { ...state, cancelCount }
}
