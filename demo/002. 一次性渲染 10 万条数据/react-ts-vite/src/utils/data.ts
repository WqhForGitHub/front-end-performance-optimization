export interface ListItem {
  id: number
  name: string
  value: number
  desc: string
}

/**
 * 生成指定数量的测试数据
 */
export function generateData(count: number): ListItem[] {
  const list: ListItem[] = []
  for (let i = 0; i < count; i++) {
    list.push({
      id: i,
      name: `第 ${i + 1} 条数据`,
      value: Math.round(Math.random() * 10000),
      desc: `这是第 ${i + 1} 条数据的描述信息，包含一些随机内容用于演示长列表渲染性能优化。`,
    })
  }
  return list
}
