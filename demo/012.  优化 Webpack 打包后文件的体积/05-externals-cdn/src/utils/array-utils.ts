/**
 * 数组工具模块
 *
 * 封装了基于 lodash 的数组操作函数。
 * 当使用 externals 配置时，lodash 不会被打包进产物，
 * 而是通过 CDN 加载，从而减小打包体积。
 */
import { chunk, flatten, random, range } from 'lodash'

/**
 * 将数组分块
 * @param array 原始数组
 * @param size 每块大小
 * @returns 分块后的二维数组
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  return chunk(array, size)
}

/**
 * 展平嵌套数组
 * @param array 嵌套数组
 * @returns 展平后的一维数组
 */
export function flattenArray<T>(array: T[][]): T[] {
  return flatten(array)
}

/**
 * 生成指定范围内的随机数数组
 * @param min 最小值
 * @param max 最大值
 * @param count 数量
 * @returns 随机数数组
 */
export function getRandomNumbers(min: number, max: number, count: number): number[] {
  const result: number[] = []
  for (let i = 0; i < count; i++) {
    result.push(random(min, max))
  }
  return result
}

/**
 * 生成数字序列
 * @param start 起始值
 * @param end 结束值（不包含）
 * @param step 步长
 * @returns 数字序列
 */
export function getRange(start: number, end?: number, step?: number): number[] {
  return range(start, end, step)
}

/**
 * 数组统计信息
 */
export interface ArraySummary {
  min: number
  max: number
  sum: number
  average: number
  count: number
}

/**
 * 计算数组的统计信息
 * @param array 数字数组
 * @returns 统计信息
 */
export function summarizeArray(array: number[]): ArraySummary {
  if (array.length === 0) {
    return { min: 0, max: 0, sum: 0, average: 0, count: 0 }
  }

  const min = Math.min(...array)
  const max = Math.max(...array)
  const sum = array.reduce((acc, cur) => acc + cur, 0)
  const average = Math.round((sum / array.length) * 100) / 100

  return {
    min,
    max,
    sum,
    average,
    count: array.length,
  }
}
