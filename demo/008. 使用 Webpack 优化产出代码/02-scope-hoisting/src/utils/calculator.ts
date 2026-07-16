import { greet, formatNumber } from './format'

/** 计算模块 B - 依赖模块 A */
export function createGreeting(name: string, count: number): string {
  return `${greet(name)} (共 ${formatNumber(count)} 条记录)`
}
