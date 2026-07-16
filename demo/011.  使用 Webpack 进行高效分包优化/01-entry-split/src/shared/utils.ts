/**
 * 共享工具函数模块
 *
 * 该模块被多个页面入口引用。
 * 在多入口分包模式下，如果未配置 splitChunks，
 * 此模块会被重复打包进每个页面的 bundle 中。
 */

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 格式化数字（千分位分隔） */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN')
}

/** 生成问候语 */
export function greet(name: string): string {
  return `你好，${name}！`
}

/** 生成随机 ID */
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
