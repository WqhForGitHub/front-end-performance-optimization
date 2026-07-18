/**
 * 模拟服务器数据源
 * 每次调用 fetchNews 返回带有当前时间戳的"最新"数据，方便观察缓存组件是否真的刷新了数据。
 */

export type Category = 'all' | 'tech' | 'sport' | 'finance'

export interface NewsItem {
  id: number
  title: string
  category: Exclude<Category, 'all'>
  publishedAt: string
}

const newsPool: Array<Omit<NewsItem, 'id' | 'publishedAt'>> = [
  { title: 'Vue 3.5 发布，响应式系统性能再提升', category: 'tech' },
  { title: 'Vite 6 引入新的环境 API', category: 'tech' },
  { title: 'TypeScript 5.5 增强类型推断能力', category: 'tech' },
  { title: '世界杯预选赛激战正酣', category: 'sport' },
  { title: '马拉松大满贯赛事圆满落幕', category: 'sport' },
  { title: 'NBA 总决赛抢七大战', category: 'sport' },
  { title: '央行宣布下调 LPR 利率', category: 'finance' },
  { title: 'A 股三大指数集体收涨', category: 'finance' },
  { title: '新能源板块迎来政策利好', category: 'finance' },
  { title: 'Webpack 与 Vite 性能对比新基准', category: 'tech' },
  { title: '欧冠决赛即将开打', category: 'sport' },
  { title: '数字人民币试点城市再扩容', category: 'finance' },
]

let seq = 1

function now(): string {
  const d = new Date()
  return (
    d.toLocaleTimeString('zh-CN', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  )
}

/**
 * 模拟异步获取新闻数据
 * 每次返回 5 条随机排序的新闻，并打上"获取时间"戳
 */
export function fetchNews(category: Category): Promise<{ fetchedAt: string; items: NewsItem[] }> {
  return new Promise((resolve) => {
    // 模拟 300ms 网络延迟
    setTimeout(() => {
      const filtered =
        category === 'all' ? newsPool : newsPool.filter((n) => n.category === category)
      // 随机打乱
      const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5)
      const items: NewsItem[] = shuffled.map((n) => ({
        id: seq++,
        title: n.title,
        category: n.category,
        publishedAt: now(),
      }))
      resolve({ fetchedAt: now(), items })
    }, 300)
  })
}
