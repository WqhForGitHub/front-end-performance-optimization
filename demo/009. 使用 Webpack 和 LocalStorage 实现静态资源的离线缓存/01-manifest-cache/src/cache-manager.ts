/**
 * CacheManager —— 基于 manifest 的 LocalStorage 缓存管理器
 *
 * 思路：
 *   1. 启动时拉取最新 manifest.json（资源清单）
 *   2. 对每个资源，先查 LocalStorage：
 *      - 命中且 hash 一致 -> 直接使用缓存
 *      - 命中但 hash 不一致 -> 拉取新版本并覆盖
 *      - 未命中 -> 拉取并写入 LocalStorage
 *   3. 通过 DOM 展示命中/未命中、缓存大小等信息
 *
 * 由于 LocalStorage 容量有限（约 5MB），这里只缓存 JS / CSS 文本资源。
 */

import type { ManifestData, ManifestEntry } from './manifest-plugin'

/** LocalStorage 中每条缓存的结构 */
interface CacheRecord {
  /** 资源名（带 hash） */
  name: string
  /** contenthash */
  hash: string
  /** 文本内容 */
  content: string
  /** 写入时间戳 */
  cachedAt: number
  /** 字节大小（粗略估计：content.length） */
  size: number
}

/** LocalStorage key 前缀，避免与其他 demo 冲突 */
const LS_PREFIX = 'mc:'

/** 拉取远程 manifest 的简单实现（带降级） */
async function fetchManifest(baseUrl: string): Promise<ManifestData> {
  const res = await fetch(`${baseUrl}/manifest.json`)
  if (!res.ok) {
    throw new Error(`拉取 manifest 失败：${res.status}`)
  }
  return (await res.json()) as ManifestData
}

/** 拉取单个资源文本 */
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`拉取资源失败：${url} -> ${res.status}`)
  }
  return res.text()
}

/** 估算 LocalStorage 已用大小（字节） */
function estimateStorageBytes(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(LS_PREFIX)) {
      const value = localStorage.getItem(key) ?? ''
      total += key.length + value.length
    }
  }
  return total
}

/** 缓存命中统计 */
interface CacheStats {
  total: number
  hit: number
  miss: number
  updated: number
  bytes: number
}

/**
 * 主流程：根据 manifest 检查并填充缓存
 */
export async function warmupCache(
  baseUrl: string,
  onProgress: (line: string) => void,
): Promise<CacheStats> {
  const stats: CacheStats = { total: 0, hit: 0, miss: 0, updated: 0, bytes: 0 }
  onProgress(`[1/3] 拉取 manifest.json ...`)

  let manifest: ManifestData
  try {
    manifest = await fetchManifest(baseUrl)
  } catch (e) {
    onProgress(`  拉取 manifest 失败：${String(e)}（请先执行 npm run build 并通过 dist 目录启动静态服务）`)
    return stats
  }

  onProgress(`[2/3] manifest 共 ${manifest.assets.length} 个资源，开始逐个检查 LocalStorage ...`)
  stats.total = manifest.assets.length

  for (const entry of manifest.assets) {
    const key = `${LS_PREFIX}${entry.name}`
    const raw = localStorage.getItem(key)
    let record: CacheRecord | null = null
    try {
      record = raw ? (JSON.parse(raw) as CacheRecord) : null
    } catch {
      record = null
    }

    if (record && record.hash === entry.hash && record.content.length > 0) {
      // 命中缓存
      stats.hit++
      onProgress(`  [HIT]   ${entry.name}（hash=${entry.hash}）使用 LocalStorage 缓存`)
      continue
    }

    // 未命中或 hash 变化，需要重新拉取
    onProgress(`  [${record ? 'UPDATE' : 'MISS'}]  ${entry.name} -> 远程拉取中 ...`)
    try {
      const content = await fetchText(`${baseUrl}/${entry.name}`)
      const next: CacheRecord = {
        name: entry.name,
        hash: entry.hash,
        content,
        cachedAt: Date.now(),
        size: content.length,
      }
      localStorage.setItem(key, JSON.stringify(next))
      if (record) {
        stats.updated++
      } else {
        stats.miss++
      }
    } catch (e) {
      onProgress(`    拉取失败：${String(e)}`)
    }
  }

  stats.bytes = estimateStorageBytes()
  onProgress(`[3/3] 完成。命中 ${stats.hit} / 更新 ${stats.updated} / 新增 ${stats.miss} / 总 ${stats.total}`)
  onProgress(`LocalStorage 已用约 ${(stats.bytes / 1024).toFixed(2)} KB`)
  return stats
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

/** 列出当前缓存条目（用于页面展示） */
export function listCache(): ManifestEntry[] {
  const list: ManifestEntry[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(LS_PREFIX)) continue
    try {
      const record = JSON.parse(localStorage.getItem(key) ?? '{}') as CacheRecord
      list.push({
        name: record.name,
        hash: record.hash,
        size: record.size,
      })
    } catch {
      // 忽略损坏的条目
    }
  }
  return list
}
