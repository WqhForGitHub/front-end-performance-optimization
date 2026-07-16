/**
 * Promise 共享 / 请求去重工具
 *
 * 核心思想：用一个 Map 按 key 缓存“进行中（in-flight）的 Promise”。
 * - 第一个调用方执行 requestFn 并把 Promise 存入缓存；
 * - 后续相同 key 的调用直接复用同一个 Promise，不再执行 requestFn；
 * - Promise 完成后（无论成功 / 失败）从缓存中移除，下一次调用会重新发起。
 *
 * 这样 3 个组件同时请求同一个 API，只会触发 1 次真实的网络请求。
 */

// 进行中的 Promise 缓存：key -> Promise
const inflightCache = new Map<string, Promise<unknown>>()

/**
 * 创建（或复用）一个请求 Promise
 *
 * @param key        请求的唯一标识（通常用 URL + 参数序列化）
 * @param requestFn  真正发起请求的函数，仅在缓存未命中时执行
 * @returns          所有相同 key 的调用方共享同一个 Promise
 */
export function createRequestPromise<T>(
  key: string,
  requestFn: () => Promise<T>,
): Promise<T> {
  // 1. 缓存命中：已有进行中的 Promise，直接复用，不再执行 requestFn
  const existing = inflightCache.get(key)
  if (existing) {
    return existing as Promise<T>
  }

  // 2. 缓存未命中：执行 requestFn 发起真实请求，并缓存 Promise
  const promise = requestFn().finally(() => {
    // 3. 请求结束后移除缓存：下次调用会重新发起请求
    //    （只去重“同时进行中”的请求，不影响后续刷新）
    inflightCache.delete(key)
  })

  inflightCache.set(key, promise)
  return promise
}

/** 手动清空进行中的请求缓存（用于强制刷新） */
export function clearRequestCache(): void {
  inflightCache.clear()
}
