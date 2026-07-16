/**
 * 数据处理模块：被入口引用，参与 loader 缓存
 */

export function processItems(items: number[]): string[] {
  return items.map((item) => {
    const squared = item * item
    const isEven = item % 2 === 0
    return `值 ${item} 的平方为 ${squared}（${isEven ? '偶' : '奇'}数）`
  })
}

export function filterLarge(items: number[], threshold: number): number[] {
  return items.filter((n) => n > threshold)
}
