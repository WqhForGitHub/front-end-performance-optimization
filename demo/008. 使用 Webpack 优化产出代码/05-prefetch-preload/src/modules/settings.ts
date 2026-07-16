/**
 * 设置面板模块（预获取 - prefetch）
 *
 * 这个模块在用户登录后「可能」会使用（打开设置页面），
 * 但不是当前页面的核心功能。
 * 使用 webpackPrefetch 让浏览器在空闲时预下载，低优先级。
 */

export interface SettingItem {
  key: string
  label: string
  value: string
}

export function getSettings(): SettingItem[] {
  return [
    { key: 'theme', label: '主题', value: 'light' },
    { key: 'language', label: '语言', value: 'zh-CN' },
    { key: 'notifications', label: '通知', value: 'enabled' },
  ]
}

export function updateSetting(key: string, value: string): SettingItem {
  return { key, label: key, value }
}

export function renderSettingsPanel(container: HTMLElement): void {
  const settings = getSettings()
  const items = settings
    .map(
      (s) =>
        `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
          <span>${s.label}</span>
          <span style="color:#666;">${s.value}</span>
        </div>`,
    )
    .join('')

  container.innerHTML = `
    <div style="margin-top:12px;padding:16px;background:#f9f9f9;border-radius:8px;">
      <h3 style="margin:0 0 12px;">设置面板（预获取加载）</h3>
      ${items}
    </div>
  `
}
