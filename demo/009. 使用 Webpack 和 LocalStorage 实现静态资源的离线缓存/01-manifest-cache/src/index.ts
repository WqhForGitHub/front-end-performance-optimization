import { warmupCache, clearCache, listCache } from './cache-manager'

const app = document.getElementById('app')

/**
 * 渲染主界面：
 *   - 标题 + 说明
 *   - 「加载缓存」按钮：触发 manifest 流程
 *   - 「清除缓存」按钮：清空本 demo 写入的 LocalStorage
 *   - 日志区：显示每个资源的 HIT / MISS / UPDATE
 *   - 列表区：显示当前 LocalStorage 中的缓存条目
 */
function renderUI(): void {
  if (!app) return
  app.innerHTML = `
    <h1>基于资源清单（manifest）的 LocalStorage 缓存</h1>
    <p style="color:#888">
      构建时由自定义 ManifestPlugin 生成 manifest.json（含每个资源 + contenthash）。<br>
      运行时 CacheManager 拉取 manifest，对比 LocalStorage 中缓存的 hash，
      命中则直接使用缓存，未命中或 hash 变化则重新拉取并写入。
    </p>
    <p>
      <button id="load">加载 / 校验缓存</button>
      <button id="clear">清除缓存</button>
    </p>
    <pre id="log" style="background:#f6f6f6;padding:12px;max-height:300px;overflow:auto;"></pre>
    <h3>当前 LocalStorage 中的缓存条目</h3>
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
  if (!listEl) return
  const items = listCache()
  if (items.length === 0) {
    listEl.innerHTML = '<li style="color:#888">（空）</li>'
    return
  }
  listEl.innerHTML = items
    .map(
      (it) =>
        `<li>${it.name} <span style="color:#888">hash=${it.hash}, size=${it.size}B</span></li>`,
    )
    .join('')
}

function bindEvents(): void {
  const loadBtn = document.getElementById('load')
  const clearBtn = document.getElementById('clear')

  loadBtn?.addEventListener('click', async () => {
    const log = document.getElementById('log')
    if (log) log.textContent = ''
    appendLog('开始缓存流程 ...')
    // baseUrl 取当前页面所在目录
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '')
    await warmupCache(baseUrl, appendLog)
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
  appendLog('提示：请先 npm run build，并通过静态服务器访问 dist/index.html')
  appendLog('      例如：npx serve -s dist')
}
