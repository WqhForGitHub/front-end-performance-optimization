/**
 * 数学工具模块
 *
 * 提供常用的数学计算函数。
 * 在运行时分离策略下，该模块作为业务代码留在 main chunk 中，
 * 与运行时代码（runtime chunk）和第三方依赖（vendors chunk）分离。
 */

/** 加法 */
export function add(a: number, b: number): number {
  return a + b
}

/** 减法 */
export function subtract(a: number, b: number): number {
  return a - b
}

/** 乘法 */
export function multiply(a: number, b: number): number {
  return a * b
}

/** 除法（除数不能为零） */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('除数不能为零')
  }
  return a / b
}

/** 阶乘 n! */
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error('阶乘不能为负数')
  }
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

/** 斐波那契数列第 n 项 */
export function fibonacci(n: number): number {
  if (n <= 0) return 0
  if (n === 1) return 1
  let a = 0
  let b = 1
  for (let i = 2; i <= n; i++) {
    const temp = a + b
    a = b
    b = temp
  }
  return b
}

/** 判断是否为质数 */
export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false
  }
  return true
}
