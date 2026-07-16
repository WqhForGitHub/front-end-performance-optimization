/**
 * 校验工具模块
 */

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateAge(age: number): boolean {
  return Number.isInteger(age) && age >= 0 && age <= 150
}

export function validateRequired(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined
}
