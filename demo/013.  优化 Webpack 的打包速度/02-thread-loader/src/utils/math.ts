/**
 * 数学工具模块
 */

export function sum(arr: number[]): number {
  return arr.reduce((acc, n) => acc + n, 0)
}

export function factorial(n: number): number {
  if (n < 0) throw new Error('n 必须为非负整数')
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}
