import {
  applyVersion,
  loadAsset,
  listCache,
  listHistory,
  resetAll,
  detectVersion,
} from './version-cache'

const app = document.getElementById('app')

/** 渲染主界面 */
function renderUI(currentVersion: string): void {
  if (!app) return
  app.innerHTML = `
    <h1>带版本管理的缓存管理</h1>
    <p style="color:#888">
      构建时通过 DefinePlugin 注入 <code>__APP_VERSION__</code>。运行时 VersionedCache
      对比 LocalStorage 中保存的版本号：版本一致则复用缓存；版本变化则清空所有旧缓存
      并重新拉取。同时记录版本变更历史，便于排查。
    </p>
    <p>当前应用版本：<code id="version">${currentVersion}</code></p>
    <p>
      <button id="load">加载资源列表</button>
      <button id="clear">重置缓存与历史</button>
    </p>
    <pre id="log" style="background:#f6f6f6;padding:12px;max-height:280px;overflow:auto;"></pre>
    <h3>当前版本缓存条目</h3>
    <ul id="list"></ul>
    <h3>版本变更历史</h3>
    <ul id="history"></ul>
  `
}

function appendLog(line: string): void {
  const log = document.getElementById('log')
  if (log) {
    log.textContent += line + '\n'
    log.scrollTop = log.scrollHeight
  }
}

function refreshList(currentVersion: string): void {
  const listEl = document.getElementById('list')
  if (!listEl) return
  const items = listCache(currentVersion)
  if (items.length === 0) {
    listEl.innerHTML = '<li style="color:#888">（空）</li>'
  } else {
    listEl.innerHTML = items
      .map(
        (it) =>
          `<li>${it.name} <span style="color:#888">v=${it.version}, ${it.bytes}B, cachedAt=${new Date(it.cachedAt).toLocaleTimeString()}</span></li>`,
      )
      .join('')
  }
}

function refreshHistory(): void {
  const histEl = document.getElementById('history')
  if (!histEl) return
  const items = listHistory()
  if (items.length === 0) {
    histEl.innerHTML = '<li style="color:#888">（无）</li>'
  } else {
    histEl.innerHTML = items
      .map(
        (it) =>
          `<li>${it.action} -> <code>${it.version}</code> <span style="color:#888">at ${new Date(it.changedAt).toLocaleString()}, 清理 ${it.clearedCount} 条</span></li>`,
      )
      .join('')
  }
}

async function bootstrap(currentVersion: string): Promise<void> {
  renderUI(currentVersion)

  // 1. 检测版本变化并应用
  const detected = detectVersion(currentVersion)
  appendLog(`当前版本：${currentVersion}`)
  appendLog(
    detected.prevVersion
      ? `上次版本：${detected.prevVersion}（${detected.changed ? '变化' : '未变化'}）`
      : `未发现历史版本（首次访问）`,
  )
  const applied = applyVersion(currentVersion)
  if (applied.changed) {
    appendLog(`版本变化！已清空 ${applied.cleared} 条旧缓存，并记录历史。`)
  } else {
    appendLog(`版本未变化，复用现有缓存。`)
  }
  refreshHistory()
  refreshList(currentVersion)

  // 2. 绑定按钮
  const loadBtn = document.getElementById('load')
  const clearBtn = document.getElementById('clear')

  loadBtn?.addEventListener('click', async () => {
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '')
    // 由于实际产物名带 contenthash，这里使用一个示意路径演示。
    // 实际使用时可从 manifest / index.html 中解析真实资源 URL。
    const demoAssets = ['js/bundle.placeholder.js']
    for (const asset of demoAssets) {
      try {
        const r = await loadAsset(baseUrl, asset, currentVersion, appendLog)
        appendLog(`  -> 来源: ${r.source}, ${r.bytes}B`)
      } catch (e) {
        appendLog(`  -> ${asset} 失败：${String(e)}`)
      }
    }
    refreshList(currentVersion)
  })

  clearBtn?.addEventListener('click', () => {
    resetAll()
    appendLog('已重置所有缓存与历史。')
    refreshHistory()
    refreshList(currentVersion)
  })
}

if (app) {
  bootstrap(__APP_VERSION__)
}
