import { useState, useMemo, useRef, useCallback } from 'react'
import type { TreeNode, FlatNode } from '../utils/treeData'
import { flattenTree, countNodes } from '../utils/treeData'

interface Props {
  data: TreeNode[]
  /** 默认展开层级 */
  defaultExpandDepth?: number
  /** 每行高度 */
  itemHeight?: number
  /** 可视区域高度 */
  viewportHeight?: number
}

/**
 * 方法二：虚拟列表渲染（推荐）
 * - 将树形数据扁平化为一维数组
 * - 只渲染可视区域内的节点
 * - 无论数据量多大，DOM 节点数恒定
 *
 * 核心思路:
 * 1. flattenTree: 递归遍历树 -> 扁平数组（带 depth 信息）
 * 2. 计算 scrollTop 对应的 startIndex 和 endIndex
 * 3. 只渲染 [startIndex, endIndex] 范围内的节点
 * 4. 用一个撑高的容器模拟完整滚动条
 */
export default function VirtualTree({
  data,
  defaultExpandDepth = 0,
  itemHeight = 32,
  viewportHeight = 500,
}: Props) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalNodes = useMemo(() => countNodes(data), [data])

  // 扁平化可见节点
  const flatNodes: FlatNode[] = useMemo(
    () => flattenTree(data, expandedKeys, defaultExpandDepth),
    [data, expandedKeys, defaultExpandDepth],
  )

  // 计算可视区域
  const {
    startIndex,
    endIndex: _endIndex,
    visibleNodes,
  } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(viewportHeight / itemHeight) + 5, // 多渲染5个做缓冲
      flatNodes.length,
    )
    const visible = flatNodes.slice(start, end)
    return { startIndex: start, endIndex: end, visibleNodes: visible }
  }, [scrollTop, itemHeight, viewportHeight, flatNodes])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  const toggle = (id: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalHeight = flatNodes.length * itemHeight
  const offsetY = startIndex * itemHeight

  return (
    <div>
      <div style={{ marginBottom: '12px', color: '#888' }}>
        总节点数: {totalNodes} | 可见(扁平化)节点数: {flatNodes.length} | 实际渲染DOM数:{' '}
        {visibleNodes.length} | 方法: 虚拟列表
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: `${viewportHeight}px`,
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          position: 'relative',
        }}
      >
        {/* 撑高容器，模拟完整滚动条 */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {/* 只渲染可视区域 */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
            }}
          >
            {visibleNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => node.hasChildren && toggle(node.id)}
                style={{
                  height: `${itemHeight}px`,
                  paddingLeft: `${node.depth * 20 + 8}px`,
                  lineHeight: `${itemHeight}px`,
                  cursor: node.hasChildren ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span style={{ display: 'inline-block', width: '20px' }}>
                  {node.hasChildren ? (node.expanded ? '▼' : '▶') : ''}
                </span>
                {node.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
