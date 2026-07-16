import { asyncPoolSimple } from './concurrency'

/**
 * 模拟 API 请求
 */

export interface User {
  id: number
  name: string
  email: string
  company: string
}

export interface FetchResult {
  users: User[]
  duration: number
  mode: 'sequential' | 'batch' | 'concurrent'
}

/** 模拟网络延迟 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 模拟单个用户请求 */
export async function fetchUser(id: number): Promise<User> {
  // 模拟 200-500ms 的网络延迟
  const latency = 200 + Math.random() * 300
  await delay(latency)
  return {
    id,
    name: `用户 ${id}`,
    email: `user${id}@example.com`,
    company: `公司 ${String.fromCharCode(65 + (id % 26))}`,
  }
}

/**
 * 顺序请求 - 一个接一个，总时间 = 所有请求时间之和
 *
 * 缺点：总耗时 = N * avg_latency，速度最慢
 */
export async function fetchUsersSequential(ids: number[]): Promise<FetchResult> {
  const start = performance.now()
  const users: User[] = []
  for (const id of ids) {
    const user = await fetchUser(id)
    users.push(user)
  }
  const duration = performance.now() - start
  return { users, duration, mode: 'sequential' }
}

/**
 * 批量请求 - 使用 Promise.all 同时发起所有请求
 *
 * 优点：总耗时 ≈ 最慢的单个请求时间
 * 缺点：请求量大时可能超出浏览器并发限制（通常 6 个）
 */
export async function fetchUsersBatch(ids: number[]): Promise<FetchResult> {
  const start = performance.now()
  const users = await Promise.all(ids.map((id) => fetchUser(id)))
  const duration = performance.now() - start
  return { users, duration, mode: 'batch' }
}

/**
 * 并发限制请求 - 使用并发池限制最大并发数
 *
 * 优点：兼顾速度和服务器压力，适合大量请求场景
 */
export async function fetchUsersConcurrent(
  ids: number[],
  concurrency: number = 3
): Promise<FetchResult> {
  const start = performance.now()
  const users = await asyncPoolSimple(concurrency, ids, (id) => fetchUser(id))
  const duration = performance.now() - start
  return { users, duration, mode: 'concurrent' }
}
