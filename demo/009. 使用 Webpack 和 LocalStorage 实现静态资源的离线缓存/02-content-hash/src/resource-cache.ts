/**
 * ResourceCache -- 基于 contenthash 的版本化缓存
 *
 * 思路：
 *   - webpack 输出文件名带 [contenthash:8]，资源内容变化时 hash 自然变化。
 *   - LocalStorage key 直接使用「资源名 + hash」作为唯一标识，
 *     如 `ch:js/app.abcd1234.js`。
 *   - 检查缓存时，用目标 URL 中提取的 hash 作为依据：
 *       * 命中同名 + 同 hash -> 缓存有效，直接复用
 *       * 命中同名但 hash 不同 -> 视为新版本，写入新 key；
 *         旧 hash 的 key 在清理阶段被移除（避免无限增长）
 *       * 未命中 -> 拉取并写入
 *
 * 这样资源变更时只需要重新拉取「内容变化了的那一份」，
 * 其余资源（如未改动的 vendor chunk）始终走缓存，节省带宽与时间。
 */

/** LocalStorage 前缀 */
const LS_PREFIX = 'ch:'

/** 从 URL 中提取 8 位 contenthash 与纯净资源名 */
interface ParsedAsset {
  /** 不含 hash 的资源逻辑名，如 js/app.js */
  logicalName: string
  /** 8 位 contenthash */
  hash: string
  /** 原始 URL，如 /js/app.abcd1234.js */
  url: string
}

/** 提取 hash 的正则 */
const HASH_REGEX = /^(.*?)(?:\.([a-f0-9]{8}))?\.(js|css)$/i

/** 将 URL 解析为资源信息 */
export function parseAssetUrl(rawUrl: string): ParsedAsset {
  // 去掉 query / hash 片段
  const cleanUrl = rawUrl.split('?')[0].split('#')[0]
  // 只保留 path 部分
  const pathOnly = cleanUrl.replace(/^https?:\/\/[^/]+/, '')
  const match = pathOnly.match(HASH_REGEX)
  if (!match) {
    return { logicalName: pathOnly, hash: '', url: pathOnly }
  }
  const logicalName = `${match[1]}.${match[3]}`
  return {
    logicalName,
    hash: match[2] ?? '',
    url: pathOnly,
  }
}

/** 单条缓存记录 */
interface CacheRecord {
  /** 逻辑资源名（不含 hash） */
  logicalName: string
  /** contenthash */
  hash: string
  /** 资源文本内容 */
  content: string
  /** 写入时间 */
  cachedAt: number
}

/** 缓存命中结果 */
export interface LoadResult {
  source: 'cache' | 'network'
  logicalName: string
  hash: string
  content: string
  bytes: number
}

/** 内部：读取一条缓存 */
function readCache(logicalName: string, hash: string): CacheRecord | null {
  const key = `${LS_PREFIX}${logicalName}@${hash}`
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CacheRecord
  } catch {
    return null
  }
}

/** 内部：写入一条缓存 */
function writeCache(record: CacheRecord): void {
  const key = `${LS_PREFIX}${record.logicalName}@${record.hash}`
  localStorage.setItem(key, JSON.stringify(record))
}

/**
 * 清理同一逻辑资源名下的「过期 hash」缓存
 * （只保留当前 hash 这一份）
 */
function evictOldHashes(logicalName: string, keepHash: string): number {
  let removed = 0
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(LS_PREFIX)) continue
    // key 形如 ch:<logicalName>@<hash>
    const rest = key.slice(LS_PREFIX.length)
    const atIdx = rest.lastIndexOf('@')
    if (atIdx < 0) continue
    const name = rest.slice(0, atIdx)
    const hash = rest.slice(atIdx + 1)
    if (name === logicalName && hash !== keepHash) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
    removed++
  }
  return removed
}

/** 拉取远程资源文本 */
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`fetch ${url} -> ${res.status}`)
  }
  return res.text()
}

/**
 * 主接口：根据 URL 加载资源（带缓存）
 *
 * @param baseUrl 资源根目录（不含资源本身）
 * @param assetPath 资源相对路径，如 js/app.abcd1234.js
 * @param onEvent 进度回调
 */
export async function loadAsset(
  baseUrl: string,
  assetPath: string,
  onEvent?: (msg: string) => void,
): Promise<LoadResult> {
  const parsed = parseAssetUrl(`${baseUrl}/${assetPath}`)
  const cached = readCache(parsed.logicalName, parsed.hash)

  if (cached && cached.content.length > 0) {
    onEvent?.(`[HIT]   ${parsed.logicalName} @ ${parsed.hash} -> LocalStorage`)
    return {
      source: 'cache',
      logicalName: parsed.logicalName,
      hash: parsed.hash,
      content: cached.content,
      bytes: cached.content.length,
    }
  }

  onEvent?.(`[MISS]  ${parsed.logicalName} @ ${parsed.hash} -> 网络`)
  const content = await fetchText(parsed.url)
  const record: CacheRecord = {
    logicalName: parsed.logicalName,
    hash: parsed.hash,
    content,
    cachedAt: Date.now(),
  }
  writeCache(record)
  // 顺手清理旧 hash 的同逻辑资源
  const evicted = evictOldHashes(parsed.logicalName, parsed.hash)
  if (evicted > 0) {
    onEvent?.(`        清理 ${evicted} 份旧 hash 缓存`)
  }

  return {
    source: 'network',
    logicalName: parsed.logicalName,
    hash: parsed.hash,
    content,
    bytes: content.length,
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

/** 列出当前所有缓存条目 */
export function listCache(): Array<{ logicalName: string; hash: string; bytes: number }> {
  const result: Array<{ logicalName: string; hash: string; bytes: number }> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(LS_PREFIX)) continue
    try {
      const record = JSON.parse(localStorage.getItem(key) ?? '{}') as CacheRecord
      result.push({
        logicalName: record.logicalName,
        hash: record.hash,
        bytes: record.content.length,
      })
    } catch {
      // 忽略损坏条目
    }
  }
  return result
}

/** 统计当前缓存总字节 */
export function estimateBytes(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(LS_PREFIX)) {
      total += (localStorage.getItem(key) ?? '').length
    }
  }
  return total
}
