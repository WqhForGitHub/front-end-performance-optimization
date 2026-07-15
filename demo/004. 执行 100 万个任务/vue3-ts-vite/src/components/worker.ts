/**
 * Web Worker 脚本
 * 在独立的线程中执行 100 万个任务，完全不阻塞主线程。
 */

function executeTask(index: number): number {
  let result = index
  result = (result * 9301 + 49297) % 233280
  result = Math.sqrt(result)
  return result
}

self.onmessage = (e: MessageEvent) => {
  const { type, total } = e.data as { type: string; total: number }

  if (type !== 'start') return

  const startTime = performance.now()
  let sum = 0
  const PROGRESS_INTERVAL = 10000

  for (let i = 0; i < total; i++) {
    sum += executeTask(i)

    if ((i + 1) % PROGRESS_INTERVAL === 0) {
      ;(self as unknown as Worker).postMessage({
        type: 'progress',
        completed: i + 1,
        total,
      })
    }
  }

  const elapsed = performance.now() - startTime

  ;(self as unknown as Worker).postMessage({
    type: 'complete',
    completed: total,
    total,
    sum,
    elapsed,
  })
}
