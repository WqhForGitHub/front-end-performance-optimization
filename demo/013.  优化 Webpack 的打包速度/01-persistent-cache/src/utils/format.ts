/**
 * 格式化模块：将原始数据转换为展示字符串
 */
import type { DataItem } from './data'

/**
 * 把数据项数组格式化为字符串列表
 */
export function formatList(items: DataItem[]): string[] {
  return items.map((item) => {
    return `[${item.id}] ${item.name} => ${item.value}`
  })
}
