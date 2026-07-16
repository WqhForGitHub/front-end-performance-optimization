import { useState, useEffect, useRef, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseFetchOptions {
  /** 请求超时时间（毫秒） */
  timeout?: number
}

/**
 * 带请求取消功能的 Fetch Hook
 *
 * 核心优化点：
 * 1. 使用 AbortController 取消进行中的请求
 * 2. 组件卸载时自动取消未完成的请求，防止内存泄漏
 * 3. 提供 cancel 方法手动取消请求
 *
 * @example
 * const { data, loading, error, cancel } = useFetch('/api/users')
 */
export function useFetch<T = unknown>(
  url: string | null,
  options?: UseFetchOptions
): FetchState<T> & { cancel: () => void; refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState((prev) => ({ ...prev, loading: false }))
  }, [])

  const refetch = useCallback(() => {
    setRefetchTrigger((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null })
      return
    }

    // 取消上一个请求（防止竞态条件）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    setState({ data: null, loading: true, error: null })

    // 超时处理
    if (options?.timeout) {
      timeoutId = setTimeout(() => controller.abort(), options.timeout)
    }

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json() as Promise<T>
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') {
          // 请求被取消，不更新状态
          return
        }
        if (!controller.signal.aborted) {
          setState({ data: null, loading: false, error: err })
        }
      })
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId)
      })

    // 组件卸载时取消请求
    return () => {
      controller.abort()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [url, refetchTrigger, options?.timeout])

  return { ...state, cancel, refetch }
}
