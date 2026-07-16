/**
 * 数学工具模块
 *
 * 本文件导出了多个函数，但 index.ts 只使用了其中一部分。
 * 开启 Tree Shaking 后，未被使用的函数会被移除。
 */

/** 被 index.ts 使用 -> 保留 */
export function add(a: number, b: number): number {
  return a + b
}

/** 被 index.ts 使用 -> 保留 */
export function multiply(a: number, b: number): number {
  return a * b
}

/** 未被使用 -> Tree Shaking 移除 */
export function subtract(a: number, b: number): number {
  return a - b
}

/** 未被使用 -> Tree Shaking 移除 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

/** 未被使用 -> Tree Shaking 移除 */
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent)
}

/** 未被使用 -> Tree Shaking 移除 */
export function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

/** 未被使用 -> Tree Shaking 移除（整个模块可能被删除） */
export function fibonacci(n: number): number {
  if (n <= 1) return n
  let a = 0
  let b = 1
  for (let i = 2; i <= n; i++) {
    const temp = a + b
    a = b
    b = temp
  }
  return b
}
