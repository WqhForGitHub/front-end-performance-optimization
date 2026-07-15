/**
 * User Timing API
 * 使用 performance.mark() 和 performance.measure() 进行自定义性能标记和测量
 *
 * 核心方法：
 *   - performance.mark(name): 在当前时间点创建一个标记
 *   - performance.measure(name, startMark, endMark): 测量两个标记之间的时间差
 *   - performance.getEntriesByType('mark'): 获取所有标记
 *   - performance.getEntriesByType('measure'): 获取所有测量
 *   - performance.clearMarks(name?): 清除标记
 *   - performance.clearMeasures(name?): 清除测量
 *
 * 用途：在业务代码中标记关键节点，精确测量各业务阶段耗时
 */

/** 创建性能标记 */
export function mark(name: string): void {
  performance.mark(name)
}

/** 测量两个标记之间的时间差 */
export function measure(name: string, startMark: string, endMark: string): number {
  try {
    performance.measure(name, startMark, endMark)
    const entries = performance.getEntriesByName(name, 'measure')
    return entries.length > 0 ? entries[entries.length - 1].duration : 0
  } catch {
    return 0
  }
}

/** 获取所有自定义标记 */
export function getMarks(): { name: string; startTime: number }[] {
  return performance.getEntriesByType('mark').map((m) => ({ name: m.name, startTime: m.startTime }))
}

/** 获取所有自定义测量 */
export function getMeasures(): { name: string; duration: number }[] {
  return performance
    .getEntriesByType('measure')
    .map((m) => ({ name: m.name, duration: m.duration }))
}

/** 清除所有自定义标记和测量 */
export function clearUserTimings(): void {
  performance.clearMarks()
  performance.clearMeasures()
}

/**
 * 演示：用 User Timing API 测量一个模拟任务
 */
export function demoUserTiming(): { name: string; duration: number }[] {
  clearUserTimings()

  // 标记开始
  mark('task-start')

  // 模拟任务 1：数据处理
  mark('data-process-start')
  // 模拟耗时操作
  const data: number[] = []
  for (let i = 0; i < 100000; i++) {
    data.push(Math.sqrt(i))
  }
  mark('data-process-end')
  measure('数据处理', 'data-process-start', 'data-process-end')

  // 模拟任务 2：DOM 构建
  mark('dom-build-start')
  // 模拟 DOM 操作
  for (let i = 0; i < 1000; i++) {
    data.push(Math.random())
  }
  mark('dom-build-end')
  measure('DOM 构建', 'dom-build-start', 'dom-build-end')

  // 模拟任务 3：渲染
  mark('render-start')
  for (let i = 0; i < 1000; i++) {
    data.push(Math.random())
  }
  mark('render-end')
  measure('渲染', 'render-start', 'render-end')

  // 总耗时
  mark('task-end')
  measure('总耗时', 'task-start', 'task-end')

  return getMeasures()
}
