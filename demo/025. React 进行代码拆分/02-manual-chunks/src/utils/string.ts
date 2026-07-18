// 模拟「字符串工具库」（类似 lodash 的字符串部分）
// 真实项目里来自 node_modules，会被归入 utils-vendor chunk。

export function camelCase(s: string): string {
  return s.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (c) => c.toLowerCase())
}

export function kebabCase(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function truncate(s: string, len: number): string {
  if (s.length <= len) return s
  return s.slice(0, len - 1) + '...'
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function repeat(s: string, n: number): string {
  return Array.from({ length: n }, () => s).join('')
}

export function mask(s: string, visible = 4): string {
  if (s.length <= visible) return repeat('*', s.length)
  return repeat('*', s.length - visible) + s.slice(-visible)
}

export const STR_LIB_VERSION = 'string-utils@2.1.0 (simulated)'
