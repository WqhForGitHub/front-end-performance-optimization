/**
 * 缓存策略工具
 *
 * 展示 Service Worker 中常用的缓存策略。
 * 这些策略在真实项目中运行在 Service Worker 的 fetch 事件中。
 *
 * 策略选择指南：
 * - Cache First:  适用于静态资源（JS、CSS、图片、字体）
 * - Network First: 适用于 API 请求、动态内容
 * - Stale While Revalidate: 适用于需要快速响应但也要更新的资源
 */

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate'

export interface CacheEntry {
  url: string
  strategy: CacheStrategy
  hit: boolean       // 是否命中缓存
  fromCache: boolean  // 响应是否来自缓存
  duration: number    // 耗时（毫秒）
  size: string        // 资源大小
  timestamp: string   // 访问时间
}

export interface StrategyInfo {
  name: string
  nameCn: string
  description: string
  bestFor: string
  color: string
  flow: string[]
}

/**
 * 缓存策略详情
 */
export const STRATEGIES: Record<CacheStrategy, StrategyInfo> = {
  'cache-first': {
    name: 'Cache First',
    nameCn: '缓存优先',
    description: '优先从缓存读取，缓存未命中时才请求网络。网络请求成功后更新缓存。',
    bestFor: '静态资源（JS、CSS、图片、字体等不常变化的资源）',
    color: '#4caf50',
    flow: ['查找缓存', '缓存命中？', '返回缓存 / 请求网络', '更新缓存', '返回响应'],
  },
  'network-first': {
    name: 'Network First',
    nameCn: '网络优先',
    description: '优先请求网络，网络失败时回退到缓存。保证数据最新。',
    bestFor: 'API 请求、动态内容等需要实时性的资源',
    color: '#2196f3',
    flow: ['请求网络', '网络成功？', '返回网络响应 / 查找缓存', '更新缓存', '返回响应'],
  },
  'stale-while-revalidate': {
    name: 'Stale While Revalidate',
    nameCn: '先返回后更新',
    description: '立即返回缓存（如果有），同时后台请求网络更新缓存。下次访问时使用新缓存。',
    bestFor: '需要快速响应但也要定期更新的资源',
    color: '#ff9800',
    flow: ['查找缓存', '返回缓存（如果有）', '同时请求网络', '更新缓存', '下次访问使用新缓存'],
  },
}

/**
 * 模拟缓存优先策略
 *
 * 真实 SW 实现：
 * ```js
 * self.addEventListener('fetch', (event) => {
 *   event.respondWith(
 *     caches.match(event.request).then((cached) => {
 *       return cached || fetch(event.request).then((response) => {
 *         caches.open('v1').then((cache) => cache.put(event.request, response.clone()))
 *         return response
 *       })
 *     })
 *   )
 * })
 * ```
 */
export async function cacheFirst(url: string): Promise<CacheEntry> {
  const start = performance.now()
  const cached = mockCacheLookup(url)
  const fromCache = cached

  if (!cached) {
    // 缓存未命中，请求网络
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))
    mockCacheSet(url)
  } else {
    // 缓存命中，直接返回
    await new Promise((r) => setTimeout(r, 5))
  }

  return {
    url,
    strategy: 'cache-first',
    hit: cached,
    fromCache,
    duration: performance.now() - start,
    size: cached ? '12.3 KB (缓存)' : '12.3 KB (网络)',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
  }
}

/**
 * 模拟网络优先策略
 */
export async function networkFirst(url: string): Promise<CacheEntry> {
  const start = performance.now()
  const cached = mockCacheLookup(url)
  let fromCache = false

  try {
    // 尝试网络请求
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300))
    mockCacheSet(url)
  } catch {
    // 网络失败，回退到缓存
    if (cached) {
      fromCache = true
      await new Promise((r) => setTimeout(r, 5))
    } else {
      throw new Error('网络请求失败且无缓存可用')
    }
  }

  return {
    url,
    strategy: 'network-first',
    hit: cached,
    fromCache,
    duration: performance.now() - start,
    size: fromCache ? '8.7 KB (缓存)' : '8.7 KB (网络)',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
  }
}

/**
 * 模拟 Stale While Revalidate 策略
 */
export async function staleWhileRevalidate(url: string): Promise<CacheEntry> {
  const start = performance.now()
  const cached = mockCacheLookup(url)
  let fromCache = false

  if (cached) {
    // 立即返回缓存
    fromCache = true
    await new Promise((r) => setTimeout(r, 5))
    // 后台异步更新缓存（不等待）
    setTimeout(() => mockCacheSet(url), 0)
  } else {
    // 无缓存，必须等待网络
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 200))
    mockCacheSet(url)
  }

  return {
    url,
    strategy: 'stale-while-revalidate',
    hit: cached,
    fromCache,
    duration: performance.now() - start,
    size: cached ? '15.6 KB (缓存)' : '15.6 KB (网络)',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
  }
}

// ===== 模拟缓存存储 =====
const mockCache = new Map<string, boolean>()

function mockCacheLookup(url: string): boolean {
  return mockCache.has(url)
}

function mockCacheSet(url: string): void {
  mockCache.set(url, true)
}

export function clearMockCache(): void {
  mockCache.clear()
}
