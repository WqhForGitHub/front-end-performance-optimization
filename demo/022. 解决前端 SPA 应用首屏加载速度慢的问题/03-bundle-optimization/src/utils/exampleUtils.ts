/**
 * exampleUtils.ts
 *
 * 用于演示 tree shaking：
 * - 命名导出（named export）可被静态分析，未使用的导出会被剔除
 * - 副作用代码（top-level 调用）会破坏 tree shaking
 * - package.json 中 sideEffects: false 告诉打包器本模块无副作用
 */

// 纯函数：会被打包（如果被 import）
export function add(a: number, b: number): number {
  return a + b
}

// 纯函数：未被 import 时会被 tree shaking 掉
export function multiply(a: number, b: number): number {
  return a * b
}

// 纯函数：未被 import 时会被 tree shaking 掉
export function formatPrice(cents: number): string {
  return '￥' + (cents / 100).toFixed(2)
}

// 仅被本模块内部使用，未导出
function internalHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return h
}

export function hashLabel(s: string): string {
  return 'id_' + internalHash(s).toString(36)
}

// 一个有“副作用”的导出（如果在此处直接执行 console.log，会阻止 tree shaking）
export const VERSION = '1.0.0'
