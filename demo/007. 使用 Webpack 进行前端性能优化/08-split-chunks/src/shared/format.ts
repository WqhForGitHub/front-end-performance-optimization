/** 被多个入口共享的公共模块，会被提取到 common chunk */
export function formatTitle(title: string): string {
  return `【${title}】`
}

export function formatList<T>(list: T[]): string {
  return `列表：${JSON.stringify(list)}`
}
