// 模拟「数学工具库」（类似 lodash 中的数学部分）
// 在真实项目里这类工具来自 node_modules，会被 manualChunks 归入 utils-vendor。
// 这里以本地模块代替，演示「工具型代码」与业务代码分离的思路。

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return sum(arr) / arr.length
}

export function max(arr: number[]): number {
  return Math.max(...arr)
}

export function min(arr: number[]): number {
  return Math.min(...arr)
}

export function round(value: number, digits = 2): number {
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi)
}

// 模拟较重的计算，体现「工具库体积」
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export const MATH_LIB_VERSION = 'math-utils@1.4.2 (simulated)'
