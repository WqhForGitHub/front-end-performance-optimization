/**
 * Prefetch / Preload 演示入口
 *
 * - auth 模块使用 webpackPreload: 与主 bundle 并行下载（高优先级）
 * - settings 模块使用 webpackPrefetch: 浏览器空闲时预获取（低优先级）
 */

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>Prefetch / Preload 演示</h1>
    <p>
      <strong>Preload</strong>：登录模块（当前页面核心功能，高优先级并行下载）<br>
      <strong>Prefetch</strong>：设置模块（未来可能用到，空闲时低优先级预获取）
    </p>
    <button id="login-btn" style="padding:8px 16px;margin:4px;cursor:pointer;">
      登录（使用 preloaded 模块）
    </button>
    <button id="settings-btn" style="padding:8px 16px;margin:4px;cursor:pointer;">
      打开设置（使用 prefetched 模块）
    </button>
    <div id="login-result"></div>
    <div id="settings-container"></div>
    <p style="color:#888;margin-top:16px;">
      构建后查看 index.html 的 &lt;head&gt;，可以看到
      &lt;link rel="preload"&gt; 和 &lt;link rel="prefetch"&gt; 标签。
    </p>
  `
}

// webpackPreload: 当前页面一定会用到的关键资源，高优先级并行下载
document.getElementById('login-btn')?.addEventListener('click', async () => {
  const { login } = await import(
    /* webpackChunkName: "auth" */
    /* webpackPreload: true */
    './modules/auth'
  )

  const result = login('admin', 'password123')
  const resultDiv = document.getElementById('login-result')
  if (resultDiv) {
    resultDiv.innerHTML = `
      <div style="margin-top:12px;padding:12px;background:#e8f5e9;border-radius:6px;">
        <strong>登录结果：</strong>${result.message}
        ${result.success ? `<br><code>${result.token}</code>` : ''}
      </div>
    `
  }
})

// webpackPrefetch: 未来可能用到的资源，空闲时低优先级下载
document.getElementById('settings-btn')?.addEventListener('click', async () => {
  const { renderSettingsPanel } = await import(
    /* webpackChunkName: "settings" */
    /* webpackPrefetch: true */
    './modules/settings'
  )

  const container = document.getElementById('settings-container')
  if (container) {
    renderSettingsPanel(container)
  }
})
