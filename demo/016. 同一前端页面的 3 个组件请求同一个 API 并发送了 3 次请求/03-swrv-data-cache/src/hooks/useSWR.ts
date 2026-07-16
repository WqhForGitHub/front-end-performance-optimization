/**
 * useSWR - 类 SWR（Stale-While-Revalidate）数据缓存 Hook
 *
 * 核心思想：用一个模块级全局 cache Map 按 key 缓存数据。
 * - 多个组件用同一个 key 调用 useSWR，会共享同一份缓存 + 同一个 in-flight Promise，
 *   因此首屏 3 个组件只会触发 1 次真实请求；
 * - 已有缓存时先立即返回“旧数据（stale）”，同时后台发起 revalidate 请求，
 *   拿到新数据后再静默更新（while revalidate）；
 * - dedupingInterval 内的重复调用直接复用 in-flight Promise，避免短时间内重复请求。
 *
 * 这与 SWR / React Query 等库的思路一致，只是这里用最小实现演示原理。
 */
import { useState, useEffect, useRef } from 'react'

interface CacheEntry<T> {
  data: T | undefined
  error: Error | undefined
  /** 进行中的 Promise，用于去重同时发出的请求 */
  promise: Promise<T> | undefined
  /** 上一次成功拿到数据的时间戳 */
  timestamp: number
  /** 是否正在后台重新验证 */
  isValidating: boolean
}

// 模块级全局缓存：所有组件共享
const cache = new Map<string, CacheEntry<any>>()
// 订阅者：key -> 一组重新渲染回调
const listeners = new Map<string, Set<() => void>>()

/** 通知某个 key 的所有订阅者重新渲染 */
function emit(key: string): void {
  const set = listeners.get(key)
  if (set) {
    set.forEach((fn) => fn())
  }
}

interface SWROptions {
  /** 去重时间窗口（ms），窗口内的重复请求复用 in-flight Promise */
  dedupingInterval?: number
}

interface SWRResult<T> {
  data: T | undefined
  error: Error | undefined
  /** 首次加载（无任何缓存数据） */
  loading: boolean
  /** 后台正在重新验证 */
  isValidating: boolean
}

export function useSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: SWROptions,
): SWRResult<T> {
  const dedupingInterval = options?.dedupingInterval ?? 2000
  const [, setVersion] = useState(0)
  const mountedRef = useRef(true)

  const rerender = () => {
    if (mountedRef.current) setVersion((v) => v + 1)
  }

  // 订阅 key 的变化
  useEffect(() => {
    mountedRef.current = true
    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key)!.add(rerender)
    return () => {
      mountedRef.current = false
      listeners.get(key)?.delete(rerender)
    }
  }, [key])

  // 触发请求（首次 / 缓存过期 / 手动 revalidate）
  useEffect(() => {
    const now = Date.now()
    let entry = cache.get(key)

    // 需要重新验证的条件：
    // 1. 没有缓存；或
    // 2. 没有 in-flight Promise，且距上次成功已超过 dedupingInterval
    const needsRevalidate =
      !entry || (!entry.promise && now - entry.timestamp > dedupingInterval)

    if (needsRevalidate) {
      if (!entry) {
        entry = {
          data: undefined,
          error: undefined,
          promise: undefined,
          timestamp: 0,
          isValidating: false,
        }
        cache.set(key, entry)
      }

      // 关键：复用 in-flight Promise，相同 key 的并发调用只发 1 次请求
      if (!entry.promise) {
        const promise = fetcher()
          .then((data) => {
            const e = cache.get(key)!
            e.data = data
            e.error = undefined
            e.promise = undefined
            e.timestamp = Date.now()
            e.isValidating = false
            emit(key)
          })
          .catch((err: Error) => {
            const e = cache.get(key)!
            e.error = err
            e.promise = undefined
            e.isValidating = false
            emit(key)
          })

        entry.promise = promise
        entry.isValidating = true
        emit(key)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const entry = cache.get(key)
  const data = entry?.data
  const error = entry?.error
  const isValidating = !!entry?.isValidating
  // loading：既没有缓存数据，也没有错误（首次加载）
  const loading = !entry?.data && !entry?.error

  return { data, error, loading, isValidating }
}

/** 手动触发某个 key 的重新验证（忽略 dedupingInterval） */
export function mutate<T>(key: string, fetcher: () => Promise<T>): void {
  let entry = cache.get(key)
  if (!entry) {
    entry = {
      data: undefined,
      error: undefined,
      promise: undefined,
      timestamp: 0,
      isValidating: false,
    }
    cache.set(key, entry)
  }
  if (entry.promise) return // 已在请求中

  const promise = fetcher()
    .then((data) => {
      const e = cache.get(key)!
      e.data = data
      e.error = undefined
      e.promise = undefined
      e.timestamp = Date.now()
      e.isValidating = false
      emit(key)
    })
    .catch((err: Error) => {
      const e = cache.get(key)!
      e.error = err
      e.promise = undefined
      e.isValidating = false
      emit(key)
    })

  entry.promise = promise
  entry.isValidating = true
  emit(key)
}

/** 清空全部缓存（用于强制刷新演示） */
export function clearSWRCache(): void {
  cache.clear()
  listeners.clear()
}
