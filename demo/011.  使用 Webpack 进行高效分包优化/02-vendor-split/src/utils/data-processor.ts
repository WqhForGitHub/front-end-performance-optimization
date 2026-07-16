/**
 * 数据处理工具模块
 *
 * 该模块使用 lodash 第三方库进行数据处理。
 * 在 vendor 分包策略下，lodash 会被分离到独立的 vendors chunk 中，
 * 而本模块的业务代码会留在主 chunk 中。
 */
import { chunk, flatten, random, map } from 'lodash'

/** 数据项接口 */
export interface DataItem {
  id: number
  value: number
  label: string
}

/** 生成指定数量的模拟数据 */
export function generateData(count: number): DataItem[] {
  return map(
    Array.from({ length: count }, (_, index) => index),
    (i) => ({
      id: i,
      value: random(1, 100),
      label: `项目 ${i + 1}`
    })
  )
}

/** 将数据分页，每页指定条数 */
export function paginateData(data: DataItem[], pageSize: number): DataItem[][] {
  return chunk(data, pageSize)
}

/** 将分页数据合并回单数组 */
export function mergePages(pages: DataItem[][]): DataItem[] {
  return flatten(pages)
}

/** 统计所有数据项 value 的总和 */
export function sumValues(data: DataItem[]): number {
  return data.reduce((total, item) => total + item.value, 0)
}
