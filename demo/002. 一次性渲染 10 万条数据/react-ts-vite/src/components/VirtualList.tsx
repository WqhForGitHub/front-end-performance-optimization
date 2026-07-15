import { useRef, useState, useCallback, UIEvent } from 'react'
import { ListItem } from '../utils/data'

interface Props {
  data: ListItem[]
  itemHeight?: number
  visibleHeight?: number
  overscan?: number
}

/**
 * 方法二：虚拟列表（推荐方案）
 * 核心原理：
 * 1. 用一个高度为 totalCount * itemHeight 的占位 div 撑出完整滚动条
 * 2. 监听 scroll，根据 scrollTop 计算当前可视区域的 startIndex / endIndex
 * 3. 只渲染 [startIndex - overscan, endIndex + overscan] 范围内的元素
 * 4. 用 transform: translateY 把可见元素偏移到正确位置
 *
 * 无论数据量多大，实际 DOM 数量恒定（约 visibleHeight/itemHeight + 2*overscan）。
 */
export default function VirtualList({
  data,
  itemHeight = 50,
  visibleHeight = 600,
  overscan = 5,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = data.length * itemHeight
  // 可视区域内能容纳的条数
  const visibleCount = Math.ceil(visibleHeight / itemHeight)

  // 计算渲染区间
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    data.length,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan,
  )

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const visibleData = data.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return (
    <div
      ref={containerRef}
      className="list-container"
      style={{ height: visibleHeight, overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      {/* 撑高容器，模拟完整滚动条 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 偏移容器，只渲染可见部分 */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleData.map((item) => (
            <div className="list-item" key={item.id} style={{ height: itemHeight }}>
              <span className="idx">#{item.id + 1}</span>
              <span className="content">
                {item.name} - 值: {item.value} - {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
