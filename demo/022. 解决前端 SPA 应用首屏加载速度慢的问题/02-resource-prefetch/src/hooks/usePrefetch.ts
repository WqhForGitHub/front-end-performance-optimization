import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * usePrefetch：在浏览器空闲时 / 指定时机预取资源
 *
 * 实现思路：
 * 1. 通过 dynamic import() 让 Vite 拆分出的路由 chunk 提前下载并执行（命中浏览器缓存）
 * 2. 或者通过插入 <link rel="prefetch"> 让浏览器在空闲时低优先级下载
 * 3. 提供 idle / hover / manual 三种触发时机
 *
 * 说明：动态 import() 在构建后对应一个 chunk 文件，提前 import 后该 chunk 会进入
 * 浏览器 HTTP 缓存与模块映射，正式访问该路由时几乎「零耗时」。
 */

export type PrefetchStatus = 'idle' | 'loading' | 'done' | 'error'

export interface PrefetchOptions {
  /** 触发时机：idle 表示浏览器空闲时自动触发 */
  trigger?: 'idle' | 'manual'
  /** 是否额外插入 <link rel="prefetch">（不执行 JS，仅下载，用于非模块资源） */
  useLink?: boolean
  /** useLink 模式下要预取的 URL */
  linkHref?: string
}

export interface PrefetchResult {
  status: PrefetchStatus
  /** 显式触发预取 */
  prefetch: () => void
  /** 预取耗时（ms），用于可视化对比 */
  duration: number
}

interface PrefetchState {
  status: PrefetchStatus
  duration: number
}

// requestIdleCallback 兼容包装
type RicCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void
const requestIdle: (cb: RicCallback) => number = (cb) => {
  const w = window as unknown as {
    requestIdleCallback?: (cb: RicCallback, opts?: { timeout: number }) => number
  }
  if (typeof w.requestIdleCallback === 'function') {
    return w.requestIdleCallback(cb, { timeout: 1500 })
  }
  return window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 200)
}

export function usePrefetch(
  loader: () => Promise<unknown>,
  options: PrefetchOptions = {}
): PrefetchResult {
  const { trigger = 'manual', useLink = false, linkHref } = options
  const [state, setState] = useState<PrefetchState>({ status: 'idle', duration: 0 })
  const startedRef = useRef<boolean>(false)

  const run = useCallback((): void => {
    if (startedRef.current) return
    startedRef.current = true
    const start = performance.now()
    setState({ status: 'loading', duration: 0 })

    const finish = (status: PrefetchStatus): void => {
      const duration = performance.now() - start
      setState({ status, duration })
    }

    // 可选：插入 <link rel="prefetch"> 用于非模块静态资源
    if (useLink && linkHref) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = linkHref
      link.as = 'fetch'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }

    // 通过 dynamic import 提前下载并执行 chunk，建立模块映射
    loader().then(
      () => finish('done'),
      () => finish('error')
    )
  }, [loader, useLink, linkHref])

  // idle 触发：在浏览器空闲时执行
  useEffect((): (() => void) | void => {
    if (trigger !== 'idle') return
    const handle = requestIdle(() => {
      run()
    })
    return (): void => {
      window.clearTimeout(handle)
    }
  }, [trigger, run])

  return {
    status: state.status,
    duration: state.duration,
    prefetch: run
  }
}

/**
 * usePrefetchOnHover：在鼠标 hover 时预取
 * 用于路由列表 / 卡片，hover 即触发对应 chunk 下载
 */
export function usePrefetchOnHover(loader: () => Promise<unknown>): {
  status: PrefetchStatus
  onMouseEnter: () => void
} {
  const { status, prefetch } = usePrefetch(loader, { trigger: 'manual' })
  return { status, onMouseEnter: prefetch }
}
