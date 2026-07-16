/**
 * 功能 C：主题切换模块
 *
 * 这是一个轻量级功能模块，常驻打包。
 */
export type Theme = 'light' | 'dark' | 'auto'

export function applyTheme(theme: Theme): string {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  return `[主题] 已切换为 ${theme} 主题`
}

export function getAvailableThemes(): Theme[] {
  return ['light', 'dark', 'auto']
}
