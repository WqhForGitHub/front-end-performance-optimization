import { range, chunk, flatten, map, filter } from 'lodash'

/**
 * 数据处理模块
 *
 * 引入多个 lodash 函数，增大 vendors chunk 体积，
 * 让 Bundle Analyzer 报告中能清晰地看到 lodash 的占比。
 */

export function generateData(count: number): number[] {
  return range(1, count + 1)
}

export function groupData(data: number[], size: number): number[][] {
  return chunk(data, size)
}

export function flattenData(data: number[][]): number[] {
  return flatten(data)
}

export function doubleAll(data: number[]): number[] {
  return map(data, (n) => n * 2)
}

export function keepEvens(data: number[]): number[] {
  return filter(data, (n) => n % 2 === 0)
}
