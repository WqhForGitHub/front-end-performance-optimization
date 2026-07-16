/**
 * 模拟后端 API（SWR 版本）
 *
 * 为了直观展示 SWR 的“后台重新验证（revalidate）”效果，
 * 返回的数据里带一个 serverTime，每次请求都会变化。
 * 这样缓存命中时看到的是旧 serverTime，revalidate 完成后更新为新的 serverTime。
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
  /** 服务端时间戳，每次请求都不同，用于观察缓存是否被刷新 */
  serverTime: number
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
 * 故意加入 800ms 延迟，便于观察 stale-while-revalidate 过程
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
        serverTime: Date.now(),
      })
    }, 800)
  })
}
