import { useState, useMemo } from 'react'
import type { TreeNode } from '../utils/treeData'
import { countNodes } from '../utils/treeData'

interface Props {
  data: TreeNode[]
}

/**
 * 方法一：直接渲染（递归全量渲染）
 * - 性能最差，仅作为对比 baseline
 * - 节点数量多时会导致页面卡死
 */
export default function NormalTree({ data }: Props) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const totalNodes = useMemo(() => countNodes(data), [data])

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

  const renderNode = (node: TreeNode, depth: number) => {
    const expanded = expandedKeys.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id}>
        <div
          style={{ paddingLeft: `${depth * 20 + 8}px`, lineHeight: '32px' }}
          onClick={() => hasChildren && toggle(node.id)}
        >
          <span style={{ display: 'inline-block', width: '20px' }}>
            {hasChildren ? (expanded ? '▼' : '▶') : ''}
          </span>
          {node.name}
        </div>
        {expanded && hasChildren && (
          <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '12px', color: '#888' }}>
        总节点数: {totalNodes} | 方法: 直接递归渲染（不推荐，节点多会卡死）
      </div>
      <div
        style={{
          height: '500px',
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        {data.map((node) => renderNode(node, 0))}
      </div>
    </div>
  )
}
