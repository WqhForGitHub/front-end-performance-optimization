/**
 * VersionedCache -- 带版本管理的缓存
 *
 * 思路：
 *   - 在 LocalStorage 中维护一个「版本键」`vc:__version__`，
 *     记录当前缓存集合对应的部署版本号。
 *   - 每次部署时，通过 webpack DefinePlugin 注入新的 __APP_VERSION__，
 *     运行时启动后对比：
 *       * 版本一致 -> 复用已有缓存，正常按 hash 加载
 *       * 版本变化 -> 视为「新部署」，先清空本 demo 写入的全部缓存，
 *         再重新拉取并写入。这样可避免老版本残留条目长期占用空间。
 *   - 同时记录一份「版本变更历史」，便于在页面上展示。
 *
 * 适用场景：
 *   - 频繁发布的小型 SPA，希望发布后立刻「以新版本为准」全部刷新
 *   - 不希望用户停留在「混合版本」的缓存状态（部分老、部分新）
 */

/** LocalStorage 前缀 */
const LS_PREFIX = 'vc:'
/** 版本键 */
const VERSION_KEY = `${LS_PREFIX}__version__`
/** 历史键 */
const HISTORY_KEY = `${LS_PREFIX}__history__`

/** 单条缓存记录 */
interface CacheRecord {
  /** 资源名（含 hash） */
  name: string
  /** 内容 */
  content: string
  /** 写入时间 */
  cachedAt: number
  /** 版本号 */
  version: string
  /** 字节大小 */
  size: number
}

/** 版本变更历史条目 */
interface VersionHistoryEntry {
  version: string
  changedAt: number
  action: 'init' | 'upgrade' | 'reset'
  clearedCount: number
}

/**
 * 检测版本变化：
 *   - 返回 { changed, prevVersion, currentVersion }
 */
export function detectVersion(currentVersion: string): {
  changed: boolean
  prevVersion: string | null
  currentVersion: string
} {
  const prevVersion = localStorage.getItem(VERSION_KEY)
  return {
    changed: prevVersion !== currentVersion,
    prevVersion,
    currentVersion,
  }
}

/** 清空本 demo 写入的所有缓存（保留版本键、历史键） */
export function clearCache(): number {
  let removed = 0
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (
      key &&
      key.startsWith(LS_PREFIX) &&
      key !== VERSION_KEY &&
      key !== HISTORY_KEY
    ) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
    removed++
  }
  return removed
}

/** 读取版本历史 */
function readHistory(): VersionHistoryEntry[] {
  const raw = localStorage.getItem(HISTORY_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as VersionHistoryEntry[]
  } catch {
    return []
  }
}

/** 写入版本历史（保留最近 20 条） */
function appendHistory(entry: VersionHistoryEntry): void {
  const history = readHistory()
  history.push(entry)
  while (history.length > 20) {
    history.shift()
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

/**
 * 应用新版本：
 *   - 如果版本变化，清空旧版本缓存，写入新版本号
 *   - 同时记录历史
 */
export function applyVersion(currentVersion: string): {
  changed: boolean
  prevVersion: string | null
  cleared: number
} {
  const { changed, prevVersion } = detectVersion(currentVersion)
  if (!changed) {
    return { changed: false, prevVersion, cleared: 0 }
  }
  const cleared = clearCache()
  localStorage.setItem(VERSION_KEY, currentVersion)
  appendHistory({
    version: currentVersion,
    changedAt: Date.now(),
    action: prevVersion ? 'upgrade' : 'init',
    clearedCount: cleared,
  })
  return { changed: true, prevVersion, cleared }
}

/** 重置：清除所有缓存 + 历史记录，回到初始状态 */
export function resetAll(): void {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(LS_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
  }
  appendHistory({
    version: '(reset)',
    changedAt: Date.now(),
    action: 'reset',
    clearedCount: keysToRemove.length,
  })
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
 * 加载资源（带版本约束的缓存）
 *
 * - 命中（同 name + 同版本）-> 直接走缓存
 * - 未命中 -> 拉取并写入
 */
export async function loadAsset(
  baseUrl: string,
  assetPath: string,
  version: string,
  onEvent?: (msg: string) => void,
): Promise<{ source: 'cache' | 'network'; content: string; bytes: number }> {
  const key = `${LS_PREFIX}${assetPath}`
  const raw = localStorage.getItem(key)
  if (raw) {
    try {
      const record = JSON.parse(raw) as CacheRecord
      if (record.version === version && record.content.length > 0) {
        onEvent?.(`[HIT]   ${assetPath}（版本 ${version}）`)
        return { source: 'cache', content: record.content, bytes: record.content.length }
      }
    } catch {
      // 忽略损坏条目
    }
  }

  onEvent?.(`[MISS]  ${assetPath} -> 网络拉取`)
  const content = await fetchText(`${baseUrl}/${assetPath}`)
  const record: CacheRecord = {
    name: assetPath,
    content,
    cachedAt: Date.now(),
    version,
    size: content.length,
  }
  try {
    localStorage.setItem(key, JSON.stringify(record))
  } catch (e) {
    onEvent?.(`  写入 LocalStorage 失败：${String(e)}（可能超出配额）`)
  }
  return { source: 'network', content, bytes: content.length }
}

/** 列出当前版本下的缓存条目 */
export function listCache(version: string): Array<{
  name: string
  version: string
  bytes: number
  cachedAt: number
}> {
  const result: Array<{ name: string; version: string; bytes: number; cachedAt: number }> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(LS_PREFIX) || key === VERSION_KEY || key === HISTORY_KEY) {
      continue
    }
    try {
      const record = JSON.parse(localStorage.getItem(key) ?? '{}') as CacheRecord
      result.push({
        name: record.name,
        version: record.version,
        bytes: record.size,
        cachedAt: record.cachedAt,
      })
    } catch {
      // 忽略损坏条目
    }
  }
  return result.filter((it) => it.version === version)
}

/** 读取版本变更历史 */
export function listHistory(): VersionHistoryEntry[] {
  return readHistory()
}
