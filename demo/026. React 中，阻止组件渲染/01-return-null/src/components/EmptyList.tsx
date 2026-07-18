import type { FC } from 'react'

/**
 * EmptyList -- 列表组件
 *
 * 演示两种"空状态"策略：
 *   - showEmptyHint=true 且无数据  -> 渲染"暂无数据"占位
 *   - showEmptyHint=false 且无数据 -> return null，DOM 完全不出现
 *
 * 关键点：组件自己决定要不要出现，而不是把判断推给父组件。
 */
interface EmptyListProps {
  items: string[]
  showEmptyHint: boolean
}

export const EmptyList: FC<EmptyListProps> = ({ items, showEmptyHint }) => {
  if (items.length === 0) {
    // 根据策略决定是渲染空状态提示，还是干脆 return null
    if (!showEmptyHint) return null
    return (
      <div className="empty-state">
        <div className="empty-icon">empty</div>
        <div>暂无数据（EmptyList 渲染了占位提示）</div>
      </div>
    )
  }

  return (
    <ul className="list">
      {items.map((item, i) => (
        <li key={i} className="list-item">
          {item}
        </li>
      ))}
    </ul>
  )
}
