import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { SkeletonList } from '../components/Skeleton'

export interface CardItem {
  id: number
  title: string
  desc: string
  author: string
  tag: string
}

const FAKE_DATA: CardItem[] = [
  { id: 1, title: 'Vite 5 构建优化实践', desc: '通过依赖预构建、手动分包与 critical CSS 提升首屏速度。', author: '性能小组', tag: '工程化' },
  { id: 2, title: 'React 18 并发渲染剖析', desc: 'Suspense + transition 让大数据列表也能保持响应。', author: '前端架构', tag: 'React' },
  { id: 3, title: '首屏指标 LCP 优化路径', desc: '图片 preload、字体 display swap、关键资源 Early Hints。', author: '监控团队', tag: '性能' },
  { id: 4, title: 'SSR 与 hydration 取舍', desc: '同构带来的 FCP 提升与 hydration 成本如何权衡。', author: '全栈组', tag: 'SSR' },
  { id: 5, title: '骨架屏设计与实现', desc: '保持布局稳定，避免 CLS，提升感知性能。', author: '设计平台', tag: 'UX' },
  { id: 6, title: 'Tree Shaking 实战', desc: 'sideEffects 字段与 ESM 静态分析的配合。', author: '构建工具', tag: 'Webpack' },
]

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const itemStyle: CSSProperties = {
  display: 'flex',
  gap: 14,
  padding: 14,
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  alignItems: 'flex-start',
}

const avatarStyle: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 8,
  background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  fontWeight: 700,
  color: '#0f1115',
}

const tagStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 10,
  color: 'var(--accent)',
  background: 'rgba(74, 222, 128, 0.12)',
  border: '1px solid rgba(74, 222, 128, 0.3)',
  borderRadius: 4,
  padding: '1px 6px',
  marginRight: 6,
}

interface CardListProps {
  /** 模拟数据请求耗时（ms） */
  delay?: number
  key?: string | number
}

export function CardList({ delay = 1200 }: CardListProps) {
  const [data, setData] = useState<CardItem[] | null>(null)

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
    return <SkeletonList count={4} type="card" />
  }

  return (
    <div style={listStyle}>
      {data.map((item) => (
        <div key={item.id} style={itemStyle}>
          <div style={avatarStyle}>{item.title.charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={tagStyle}>{item.tag}</span>
              <strong style={{ fontSize: 14 }}>{item.title}</strong>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>{item.desc}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 6 }}>— {item.author}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardList
