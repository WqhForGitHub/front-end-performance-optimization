/**
 * 工具模块 - 包含会抛出异常的函数
 *
 * 用于演示 Source Map 在错误追踪中的作用：
 * - 有 Source Map 时，错误堆栈指向原始源码行号
 * - 无 Source Map 时，错误堆栈指向压缩后的代码，难以定位
 */

export function processData(input: number[]): number {
  if (input.length === 0) {
    throw new Error('输入数组不能为空')
  }

  const sum = input.reduce((acc, n) => acc + n, 0)
  const avg = sum / input.length

  if (isNaN(avg)) {
    throw new Error('计算结果无效')
  }

  return Math.round(avg * 100) / 100
}

export function safeProcess(input: number[]): { success: boolean; result?: number; error?: string } {
  try {
    const result = processData(input)
    return { success: true, result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
