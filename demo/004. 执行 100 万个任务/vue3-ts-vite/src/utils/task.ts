/** 任务相关的类型定义和工具函数 */

/** 单个任务的函数：简单的数学计算 */
export function executeTask(index: number): number {
  let result = index
  result = (result * 9301 + 49297) % 233280
  result = Math.sqrt(result)
  return result
}

/** 格式化毫秒 */
export function fmtMs(ms: number): string {
  if (ms < 1000) return ms.toFixed(0) + ' ms'
  return (ms / 1000).toFixed(2) + ' s'
}

/** 格式化百分比 */
export function fmtPct(completed: number, total: number): string {
  if (total === 0) return '0%'
  return ((completed / total) * 100).toFixed(1) + '%'
}
