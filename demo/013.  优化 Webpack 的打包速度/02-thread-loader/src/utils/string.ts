/**
 * 字符串工具模块
 */

export function reverse(str: string): string {
  return str.split('').reverse().join('')
}

export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function repeat(str: string, times: number): string {
  return str.repeat(times)
}
