import { useMemo } from 'react'
import { ListItem } from '../utils/data'

interface Props {
  data: ListItem[]
}

/**
 * 方法一：直接渲染（baseline）
 * 一次性把 10 万条数据全部渲染成 DOM，页面会明显卡顿甚至假死。
 * 仅作为对比基准，实际项目中不要这样做。
 */
export default function NormalList({ data }: Props) {
  const items = useMemo(() => data, [data])

  return (
    <div className="list-container">
      {items.map((item) => (
        <div className="list-item" key={item.id}>
          <span className="idx">#{item.id + 1}</span>
          <span className="content">
            {item.name} - 值: {item.value} - {item.desc}
          </span>
        </div>
      ))}
    </div>
  )
}
