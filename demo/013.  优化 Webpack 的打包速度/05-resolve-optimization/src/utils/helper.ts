/**
 * 辅助工具模块
 */
import { APP_NAME } from './constants'

export function buildGreeting(name: string): string {
  return `${APP_NAME} 你好，欢迎使用 ${name}！`
}

export function padLeft(value: number, length: number): string {
  return String(value).padStart(length, '0')
}
