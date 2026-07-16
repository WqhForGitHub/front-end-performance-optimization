/**
 * 数据获取模块：模拟从接口拉取一批数据
 */

export interface DataItem {
  id: number
  name: string
  value: number
}

/**
 * 生成一批模拟数据
 */
export function fetchData(): DataItem[] {
  const result: DataItem[] = []
  for (let i = 0; i < 20; i++) {
    result.push({
      id: i + 1,
      name: `数据项 ${i + 1}`,
      value: Math.floor(Math.random() * 1000)
    })
  }
  return result
}
