/**
 * useSharedRequest - 基于 Promise 共享的请求 Hook
 *
 * 每个组件独立调用此 Hook，但底层通过 createRequestPromise 去重：
 * 3 个组件用同一个 key 调用，只会触发 1 次真实请求，
 * 但每个组件都能拿到自己的 data/loading/error 状态。
 */
import { useState, useEffect } from 'react'
import { createRequestPromise } from '../utils/requestPromise'

interface SharedRequestState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

export function useSharedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): SharedRequestState<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // 关键：通过 createRequestPromise 复用进行中的 Promise
    createRequestPromise<T>(key, requestFn)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(undefined)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps])

  return { data, loading, error }
}
