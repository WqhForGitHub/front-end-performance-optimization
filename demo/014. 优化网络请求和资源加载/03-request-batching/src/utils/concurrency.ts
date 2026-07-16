/**
 * 并发控制工具
 *
 * 限制同时执行的异步操作数量，避免一次性发起过多请求
 * 导致浏览器连接数耗尽或服务器压力过大。
 */

/**
 * 并发池 - 限制最大并发数的异步任务执行器
 *
 * @param limit 最大并发数
 * @param items 待处理的任务数组
 * @param iteratorFn 对每个 item 执行的异步函数
 * @returns 所有任务的返回结果数组（顺序与 items 一致）
 *
 * @example
 * const results = await asyncPool(3, [1,2,3,4,5], async (n) => {
 *   const res = await fetch(`/api/${n}`)
 *   return res.json()
 * })
 */
export async function asyncPool<T, R>(
  limit: number,
  items: T[],
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  const executing: Promise<void>[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    // 创建任务：执行异步函数并保存结果
    const task = iteratorFn(item, i).then((result) => {
      results[i] = result
    })

    executing.push(task)

    // 当并发数达到上限时，等待最快的任务完成
    if (executing.length >= limit) {
      await Promise.race(executing)
      // 移除已完成的任务
      const settled = executing.filter((p) => {
        // 检查 Promise 是否已 settle（不通过 await 判断）
        let settled = false
        p.then(() => { settled = true }).catch(() => { settled = true })
        return settled
      })
      // 更简单的实现：直接用 race 后重建数组
      executing.splice(0, executing.length - limit + 1)
    }
  }

  // 等待所有剩余任务完成
  await Promise.all(executing)
  return results
}

/**
 * 简化版并发池实现（更清晰易懂）
 *
 * 原理：
 * 1. 维护一个正在执行的 Promise 集合
 * 2. 每次添加新任务时，如果集合大小 >= limit，等待任意一个完成
 * 3. 所有任务添加完毕后，等待全部完成
 */
export async function asyncPoolSimple<T, R>(
  limit: number,
  items: T[],
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  const executing: Set<Promise<void>> = new Set()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const promise = iteratorFn(item, i).then((result) => {
      results[i] = result
    })
    executing.add(promise)

    // 任务完成后从集合中移除
    promise.finally(() => executing.delete(promise))

    // 达到并发上限时，等待任意一个完成
    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  // 等待所有剩余任务
  await Promise.all(executing)
  return results
}
