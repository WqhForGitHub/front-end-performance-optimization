/**
 * 模拟后端 API
 *
 * 重点：模块级 requestCount 用于统计真实发起的网络请求次数。
 * 在方案二（Context 状态提升）中，请求只在 DataProvider 顶层发起一次，
 * 因此计数器最终应为 1。
 */

export interface UserData {
  name: string
  role: string
  stats: {
    followers: number
    following: number
    posts: number
  }
  activity: string[]
}

/** 全局请求计数器：记录真实发起的请求数 */
let requestCount = 0

/** 读取当前请求计数 */
export function getRequestCount(): number {
  return requestCount
}

/** 重置请求计数（用于刷新演示） */
export function resetRequestCount(): void {
  requestCount = 0
}

/**
 * 模拟获取用户信息的网络请求
 * 故意加入 800ms 延迟，便于观察 loading 与单次请求效果
 */
export function fetchUser(): Promise<UserData> {
  requestCount++
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: '张三',
        role: '前端工程师',
        stats: {
          followers: 1280,
          following: 320,
          posts: 86,
        },
        activity: [
          '发布了文章《React 性能优化实践》',
          '收藏了仓库 facebook/react',
          '评论了 Issue #23456',
          '创建了项目 perf-optimization-demo',
        ],
      })
    }, 800)
  })
}
