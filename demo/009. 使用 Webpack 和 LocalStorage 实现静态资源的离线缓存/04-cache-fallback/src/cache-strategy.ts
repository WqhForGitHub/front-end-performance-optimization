/**
 * CacheStrategy -- 带降级策略的缓存
 *
 * 策略：Cache-First with Network Fallback
 *   1. 先尝试 LocalStorage 中的缓存 -> 命中则直接返回
 *   2. 未命中 -> 拉取网络 -> 成功后写入 LocalStorage
 *   3. 网络也失败 -> 抛出明确错误（调用方可展示「离线」提示）
 *
 * 容量管理（Eviction）：
 *   - LocalStorage 配额约 5MB，写入超限时浏览器抛出 QuotaExceededError
 *   - 我们在写入失败时触发 LRU 淘汰：按 cachedAt 升序删除最久未访问的条目，
 *     直到再次写入成功，或没有可淘汰的条目为止
 *   - 同时维护一个最大条目数（默认 50），超过时主动淘汰最旧的若干条
 *
 * 元数据：
 *   - 每条缓存记录 cachedAt（写入时间）和 lastAccessAt（最近访问时间）
 *   - LRU 淘汰以 lastAccessAt 升序为准
 */

/** LocalStorage 前缀 */
const LS_PREFIX = 'cf:'

/** 默认最大条目数 */
const DEFAULT_MAX_ENTRIES = 50

/** 单条缓存记录 */
interface CacheRecord {
  /** 资源名（含 hash 或 query） */
  name: string
  /** 文本内容 */
  content: string
  /** 字节大小（content.length） */
  size: number
  /** 写入时间 */
  cachedAt: number
  /** 最近访问时间 */
  lastAccessAt: number
}

/** 加载结果 */
export interface LoadResult {
  source: 'cache' | 'network' | 'error'
  content: string
  bytes: number
  message?: string
}

/** 内部：读取一条缓存记录（不更新 lastAccessAt） */
function readRaw(name: string): CacheRecord | null {
  const key = `${LS_PREFIX}${name}`
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CacheRecord
  } catch {
    return null
  }
}

/** 内部：写入一条缓存记录（含容量管理） */
function writeRaw(record: CacheRecord, maxEntries: number): boolean {
  try {
    localStorage.setItem(`${LS_PREFIX}${record.name}`, JSON.stringify(record))
    return true
  } catch (e) {
    // 可能是 QuotaExceededError，触发 LRU 淘汰
    const evicted = evictLRU(Math.ceil(maxEntries * 0.2) || 1)
    if (evicted === 0) {
      // 没有任何可淘汰条目，再试一次也徒劳
      return false
    }
    try {
      localStorage.setItem(`${LS_PREFIX}${record.name}`, JSON.stringify(record))
      return true
    } catch {
      return false
    }
  }
}

/** 列出所有缓存条目（用于 LRU 淘汰与统计） */
function listAll(): CacheRecord[] {
  const result: CacheRecord[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(LS_PREFIX)) continue
    try {
      const record = JSON.parse(localStorage.getItem(key) ?? '{}') as CacheRecord
      if (record && record.name) {
        result.push(record)
      }
    } catch {
      // 忽略损坏条目
    }
  }
  return result
}

/**
 * LRU 淘汰：按 lastAccessAt 升序删除若干条最旧条目
 * @param count 要淘汰的条数
 * @returns 实际淘汰的条数
 */
function evictLRU(count: number): number {
  const all = listAll()
  if (all.length === 0) return 0
  all.sort((a, b) => a.lastAccessAt - b.lastAccessAt)
  let evicted = 0
  for (let i = 0; i < Math.min(count, all.length); i++) {
    localStorage.removeItem(`${LS_PREFIX}${all[i].name}`)
    evicted++
  }
  return evicted
}

/** 控制最大条目数：超过则按 LRU 淘汰 */
function enforceMaxEntries(maxEntries: number): number {
  const all = listAll()
  if (all.length <= maxEntries) return 0
  const overflow = all.length - maxEntries
  return evictLRU(overflow)
}

/** 拉取远程资源文本 */
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.text()
}

/**
 * 加载资源：Cache-First + Network-Fallback
 *
 * @param baseUrl 资源根目录
 * @param assetPath 资源相对路径
 * @param options 配置项
 */
export async function loadAsset(
  baseUrl: string,
  assetPath: string,
  options: { maxEntries?: number; onEvent?: (msg: string) => void } = {},
): Promise<LoadResult> {
  const { maxEntries = DEFAULT_MAX_ENTRIES, onEvent } = options

  // 1) 尝试 LocalStorage 缓存
  const cached = readRaw(assetPath)
  if (cached && cached.content.length > 0) {
    // 更新 lastAccessAt（LRU 用），失败也不影响主流程
    cached.lastAccessAt = Date.now()
    try {
      localStorage.setItem(`${LS_PREFIX}${assetPath}`, JSON.stringify(cached))
    } catch {
      // 忽略更新访问时间时的写入失败
    }
    onEvent?.(`[CACHE]   ${assetPath} 命中缓存（${cached.size}B）`)
    return {
      source: 'cache',
      content: cached.content,
      bytes: cached.content.length,
    }
  }

  // 2) 未命中，尝试网络
  onEvent?.(`[NETWORK] ${assetPath} 未命中缓存，尝试网络 ...`)
  try {
    const content = await fetchText(`${baseUrl}/${assetPath}`)
    const now = Date.now()
    const record: CacheRecord = {
      name: assetPath,
      content,
      size: content.length,
      cachedAt: now,
      lastAccessAt: now,
    }
    const ok = writeRaw(record, maxEntries)
    if (!ok) {
      onEvent?.(`  写入 LocalStorage 失败（可能配额不足），仅本次返回内容`)
    }
    // 主动控制最大条目数
    const evicted = enforceMaxEntries(maxEntries)
    if (evicted > 0) {
      onEvent?.(`  容量管理：淘汰 ${evicted} 条最旧缓存`)
    }
    return {
      source: 'network',
      content,
      bytes: content.length,
      message: ok ? '已写入缓存' : '写入失败（配额不足）',
    }
  } catch (e) {
    // 3) 网络也失败
    onEvent?.(`[ERROR]   ${assetPath} 网络失败：${String(e)}`)
    return {
      source: 'error',
      content: '',
      bytes: 0,
      message: String(e),
    }
  }
}

/** 清空本 demo 写入的所有缓存 */
export function clearCache(): number {
  let removed = 0
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(LS_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
    removed++
  }
  return removed
}

/** 列出所有缓存条目（用于页面展示） */
export function listCache(): Array<{
  name: string
  size: number
  cachedAt: number
  lastAccessAt: number
}> {
  return listAll()
    .map((r) => ({
      name: r.name,
      size: r.size,
      cachedAt: r.cachedAt,
      lastAccessAt: r.lastAccessAt,
    }))
    .sort((a, b) => b.lastAccessAt - a.lastAccessAt)
}

/** 统计当前缓存总字节与条目数 */
export function getStats(): { count: number; bytes: number } {
  const all = listAll()
  return {
    count: all.length,
    bytes: all.reduce((sum, r) => sum + r.size, 0),
  }
}

/** 估算 LocalStorage 剩余可用空间（粗略，基于 5MB 配额假设） */
export function estimateRemainingBytes(): number {
  const { bytes } = getStats()
  const QUOTA = 5 * 1024 * 1024
  return Math.max(0, QUOTA - bytes)
}
