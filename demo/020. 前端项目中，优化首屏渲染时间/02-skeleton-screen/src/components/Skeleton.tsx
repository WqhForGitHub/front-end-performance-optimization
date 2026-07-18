import type { CSSProperties } from 'react'

interface SkeletonBoxProps {
  width?: number | string
  height?: number | string
  radius?: number | string
  style?: CSSProperties
  className?: string
  key?: string | number
}

const baseStyle: CSSProperties = {
  display: 'block',
}

export function SkeletonBox({
  width = '100%',
  height = 14,
  radius = 6,
  style,
  className,
}: SkeletonBoxProps) {
  return (
    <span
      className={`skeleton-block${className ? ' ' + className : ''}`}
      style={{
        ...baseStyle,
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  lineHeight?: number
  gap?: number
  width?: string | number
  lastWidth?: string | number
}

export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  width = '100%',
  lastWidth = '60%',
}: SkeletonTextProps) {
  const items = []
  for (let i = 0; i < lines; i++) {
    items.push(
      <SkeletonBox
        key={i}
        width={i === lines - 1 ? lastWidth : width}
        height={lineHeight}
        style={{ marginBottom: i === lines - 1 ? 0 : gap }}
      />,
    )
  }
  return <div>{items}</div>
}

const cardStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  padding: 14,
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 10,
}

export function SkeletonCard() {
  return (
    <div style={cardStyle}>
      <SkeletonBox width={56} height={56} radius={8} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <SkeletonBox width="50%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonText lines={2} lineHeight={10} gap={6} />
      </div>
    </div>
  )
}

const articleStyle: CSSProperties = {
  padding: 16,
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 10,
}

export function SkeletonArticle() {
  return (
    <div style={articleStyle}>
      <SkeletonBox width="70%" height={20} style={{ marginBottom: 14 }} />
      <SkeletonBox width={120} height={80} radius={8} style={{ marginBottom: 14 }} />
      <SkeletonText lines={4} lineHeight={11} gap={7} />
    </div>
  )
}

export function SkeletonList({
  count = 3,
  type = 'card',
}: {
  count?: number
  type?: 'card' | 'article'
}) {
  const items = []
  for (let i = 0; i < count; i++) {
    items.push(type === 'card' ? <SkeletonCard key={i} /> : <SkeletonArticle key={i} />)
  }
  return <div style={{ display: 'grid', gap: 12 }}>{items}</div>
}
