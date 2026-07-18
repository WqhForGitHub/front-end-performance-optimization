import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { SkeletonList } from '../components/Skeleton'

export interface ArticleItem {
  id: number
  title: string
  excerpt: string
  body: string
  readTime: number
}

const FAKE_DATA: ArticleItem[] = [
  {
    id: 1,
    title: '前端首屏性能优化全景图',
    excerpt: '从网络、构建、渲染、运行时四个维度梳理首屏优化的核心思路。',
    body: '首屏性能 = 资源到达浏览器的速度 × 浏览器渲染速度。本文从网络层（HTTP/2、Early Hints、CDN）、构建层（Tree Shaking、代码分割、Critical CSS）、渲染层（SSR、预渲染、骨架屏）和运行时层（虚拟列表、并发更新）四个维度系统梳理。',
    readTime: 8,
  },
  {
    id: 2,
    title: 'Suspense 与骨架屏的边界',
    excerpt: '什么时候用 Suspense fallback，什么时候用内部骨架屏？',
    body: 'Suspense fallback 适合 JS chunk 还在下载时的占位；内部骨架屏适合组件已挂载但数据未到时的占位。两者可以叠加：Suspense 显示骨架卡片，组件加载完成后再用同一骨架在内部填充，避免视觉跳变。',
    readTime: 5,
  },
  {
    id: 3,
    title: '代码分割的粒度选择',
    excerpt: '过粗失去意义，过细反而增加请求开销。',
    body: '按路由分割是基线，进一步可以按用户路径分割（首屏可见 vs 折叠区 vs Modal 内部）。注意预取（prefetch）策略：用户 hovering 菜单时预取，能将「点开 - 看见内容」的耗时降到几乎为 0。',
    readTime: 6,
  },
]

const articleStyle: CSSProperties = {
  padding: 18,
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  marginBottom: 12,
}

interface ArticleListProps {
  delay?: number
  key?: string | number
}

export function ArticleList({ delay = 1800 }: ArticleListProps) {
  const [data, setData] = useState<ArticleItem[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) setData(FAKE_DATA)
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [delay])

  if (!data) {
    return <SkeletonList count={3} type="article" />
  }

  return (
    <div>
      {data.map((item) => (
        <article key={item.id} style={articleStyle}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{item.title}</h3>
          <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 8 }}>
            {item.excerpt}
          </div>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
            {item.body}
          </p>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
            预计阅读 {item.readTime} 分钟
          </div>
        </article>
      ))}
    </div>
  )
}

export default ArticleList
