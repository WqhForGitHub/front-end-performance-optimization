import { chunk, flatten } from 'lodash'

export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0)
}

export function formatResult(value: number): string {
  return `结果是 ${value}`
}

/** 演示引入第三方库，增加编译工作量，凸显 thread-loader 的并行优势 */
export function groupAndFlatten(numbers: number[], size: number): number[] {
  return flatten(chunk(numbers, size))
}
