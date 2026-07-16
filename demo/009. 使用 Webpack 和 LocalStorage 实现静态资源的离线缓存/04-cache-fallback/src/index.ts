import {
  loadAsset,
  clearCache,
  listCache,
  getStats,
  estimateRemainingBytes,
} from './cache-strategy'

const app = document.getElementById('app')

/** 渲染主界面 */
function renderUI(): void {
  if (!app) return
  app.innerHTML = `
    <h1>带降级策略的缓存（Cache-First + Network Fallback）</h1>
    <p style="color:#888">
      加载顺序：LocalStorage 缓存 -> 网络 -> 错误（降级提示）。<br>
      写入失败时触发 LRU 淘汰，控制最大条目数；离线 + 命中缓存时仍可正常加载。
    </p>
    <p>
      <input id="asset" value="js/bundle.placeholder.js" style="width:280px" />
      <button id="load">加载资源</button>
      <button id="loadMany">连续加载 5 个资源（演示容量管理）</button>
      <button id="clear">清除缓存</button>
    </p>
    <pre id="log" style="background:#f6f6f6;padding:12px;max-height:300px;overflow:auto;"></pre>
    <h3>缓存统计</h3>
    <p id="stats" style="color:#888"></p>
    <h3>当前缓存条目（按最近访问时间倒序）</h3>
    <ul id="list"></ul>
  `
}

function appendLog(line: string): void {
  const log = document.getElementById('log')
  if (log) {
    log.textContent += line + '\n'
    log.scrollTop = log.scrollHeight
  }
}

function refreshList(): void {
  const listEl = document.getElementById('list')
  const statsEl = document.getElementById('stats')
  if (listEl) {
    const items = listCache()
    if (items.length === 0) {
      listEl.innerHTML = '<li style="color:#888">（空）</li>'
    } else {
      listEl.innerHTML = items
        .map(
          (it) =>
            `<li>${it.name} <span style="color:#888">${it.size}B, 写入 ${new Date(it.cachedAt).toLocaleTimeString()}, 访问 ${new Date(it.lastAccessAt).toLocaleTimeString()}</span></li>`,
        )
        .join('')
    }
  }
  if (statsEl) {
    const stats = getStats()
    const remaining = estimateRemainingBytes()
    statsEl.textContent = `条目数：${stats.count}，已用 ${(stats.bytes / 1024).toFixed(2)} KB，剩余约 ${(remaining / 1024).toFixed(2)} KB（按 5MB 配额估算）`
  }
}

function bindEvents(): void {
  const assetInput = document.getElementById('asset') as HTMLInputElement | null
  const loadBtn = document.getElementById('load')
  const loadManyBtn = document.getElementById('loadMany')
  const clearBtn = document.getElementById('clear')

  loadBtn?.addEventListener('click', async () => {
    const assetPath = assetInput?.value.trim() ?? ''
    if (!assetPath) {
      appendLog('请输入资源路径')
      return
    }
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '')
    const result = await loadAsset(baseUrl, assetPath, {
      maxEntries: 50,
      onEvent: appendLog,
    })
    appendLog(
      `  -> 来源: ${result.source}, ${result.bytes}B${result.message ? ', ' + result.message : ''}`,
    )
    refreshList()
  })

  loadManyBtn?.addEventListener('click', async () => {
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '')
    // 用不同的「虚拟」资源名演示连续写入与容量管理
    // 实际可替换为真实的多个产物 URL
    for (let i = 1; i <= 5; i++) {
      const assetPath = `js/demo-resource-${i}.js`
      try {
        const result = await loadAsset(baseUrl, assetPath, {
          maxEntries: 50,
          onEvent: appendLog,
        })
        appendLog(
          `  -> 来源: ${result.source}, ${result.bytes}B${result.message ? ', ' + result.message : ''}`,
        )
      } catch (e) {
        appendLog(`  -> ${assetPath} 异常：${String(e)}`)
      }
    }
    refreshList()
  })

  clearBtn?.addEventListener('click', () => {
    const removed = clearCache()
    appendLog(`已清除 ${removed} 条缓存`)
    refreshList()
  })
}

if (app) {
  renderUI()
  refreshList()
  bindEvents()
  appendLog('提示：本 demo 的核心是降级策略与 LRU 容量管理。')
  appendLog('      可在 dist 目录通过 npx serve -s 启动静态服务后访问本页测试。')
  appendLog('      离线时（断网 + 已有缓存）应仍能加载；离线且无缓存时会进入 error 分支。')
}
