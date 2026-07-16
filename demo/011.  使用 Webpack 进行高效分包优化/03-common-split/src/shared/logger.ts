/**
 * 共享日志模块
 *
 * 被 pageA 和 pageB 同时引用，
 * 会被 splitChunks 提取到 common chunk 中。
 */

/** 日志级别枚举 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/** 通用日志输出函数 */
export function log(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${level}] ${message}`)
}

/** 输出 INFO 级别日志 */
export function logInfo(message: string): void {
  log(LogLevel.INFO, message)
}

/** 输出 WARN 级别日志 */
export function logWarn(message: string): void {
  log(LogLevel.WARN, message)
}

/** 输出 ERROR 级别日志 */
export function logError(message: string): void {
  log(LogLevel.ERROR, message)
}
