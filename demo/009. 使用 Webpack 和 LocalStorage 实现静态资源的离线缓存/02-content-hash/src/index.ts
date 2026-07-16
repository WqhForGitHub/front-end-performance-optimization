import { loadAsset, clearCache, listCache, estimateBytes } from './resource-cache'

const app = document.getElementById('app')

/** 渲染主界面 */
function renderUI(): void {
  if (!app) return
  app.innerHTML = `
    <h1>基于 contenthash 的版本化缓存</h1>
    <p style="color:#888">
      产物文件名带 <code>[contenthash:8]</code>，资源内容变化时 hash 自动变化。<br>
      ResourceCache 以「逻辑名 + hash」作为 LocalStorage key，
      只在 hash 真正变化时才重新拉取，其余资源全部走缓存。
    </p>
    <p>
      <input id="asset" value="js/bundle.demohash.js" style="width:280px" />
      <button id="load">加载该资源</button>
      <button id="loadBuiltin">加载内置资源列表</button>
      <button id="clear">清除缓存</button>
    </p>
    <pre id="log" style="background:#f6f6f6;padding:12px;max-height:300px;overflow:auto;"></pre>
    <h3>当前 LocalStorage 中的缓存条目</h3>
    <ul id="list"></ul>
    <p id="bytes" style="color:#888"></p>
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
  const bytesEl = document.getElementById('bytes')
  if (!listEl) return
  const items = listCache()
  if (items.length === 0) {
    listEl.innerHTML = '<li style="color:#888">（空）</li>'
  } else {
    listEl.innerHTML = items
      .map(
        (it) =>
          `<li>${it.logicalName} <span style="color:#888">@ ${it.hash}, ${it.bytes}B</span></li>`,
      )
      .join('')
  }
  if (bytesEl) {
    bytesEl.textContent = `LocalStorage 本 demo 缓存占用约 ${(estimateBytes() / 1024).toFixed(2)} KB`
  }
}

function bindEvents(): void {
  const assetInput = document.getElementById('asset') as HTMLInputElement | null
  const loadBtn = document.getElementById('load')
  const loadBuiltinBtn = document.getElementById('loadBuiltin')
  const clearBtn = document.getElementById('clear')

  loadBtn?.addEventListener('click', async () => {
    const assetPath = assetInput?.value.trim() ?? ''
    if (!assetPath) {
      appendLog('请输入资源路径')
      return
    }
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '')
    try {
      const result = await loadAsset(baseUrl, assetPath, appendLog)
      appendLog(
        `  -> 来源: ${result.source}, 大小: ${result.bytes}B, hash: ${result.hash || '(无)'}`,
      )
    } catch (e) {
      appendLog(`  -> 失败：${String(e)}`)
    }
    refreshList()
  })

  loadBuiltinBtn?.addEventListener('click', async () => {
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '')
    // 扫描 dist 目录下的产物可以通过 fetch 目录列表实现，
    // 但静态服务器通常未开启目录浏览，这里改为「尝试加载若干典型资源」演示。
    const candidates = ['js/bundle.demohash.js', 'js/bundle.abcd1234.js']
    for (const p of candidates) {
      try {
        const result = await loadAsset(baseUrl, p, appendLog)
        appendLog(
          `  -> 来源: ${result.source}, 大小: ${result.bytes}B, hash: ${result.hash || '(无)'}`,
        )
      } catch (e) {
        appendLog(`  -> ${p} 失败：${String(e)}`)
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
  appendLog('提示：实际产物名带真实 contenthash，请把输入框替换为 dist/js/ 下真实的文件名。')
  appendLog('      可在 dist 目录通过 npx serve -s 启动静态服务后访问本页测试。')
}
