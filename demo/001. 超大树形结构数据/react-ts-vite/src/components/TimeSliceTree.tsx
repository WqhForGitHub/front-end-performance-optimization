import { useState, useTransition, useMemo, useCallback } from 'react'
import type { TreeNode, FlatNode } from '../utils/treeData'
import { flattenTree, countNodes } from '../utils/treeData'

interface Props {
  data: TreeNode[]
  defaultExpandDepth?: number
}

/**
 * 方法三：时间分片（useTransition）
 * - 利用 React 18 的并发特性 useTransition
 * - 将"展开/折叠"标记为低优先级更新，不阻塞用户输入
 * - 数据量大时展示 loading 态，体验更平滑
 *
 * 适用场景:
 * - 不能用虚拟列表的场景（需要全量 DOM，如搜索高亮）
 * - 数据处理本身耗时，希望保持 UI 响应
 */
export default function TimeSliceTree({ data, defaultExpandDepth = 0 }: Props) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const totalNodes = useMemo(() => countNodes(data), [data])

  const flatNodes: FlatNode[] = useMemo(
    () => flattenTree(data, expandedKeys, defaultExpandDepth),
    [data, expandedKeys, defaultExpandDepth],
  )

  const toggle = useCallback((id: string) => {
    // 用 startTransition 包裹，降低优先级
    startTransition(() => {
      setExpandedKeys((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '12px', color: '#888' }}>
        总节点数: {totalNodes} | 扁平化节点数: {flatNodes.length} | 方法: 时间分片 (useTransition)
        {isPending && <span style={{ color: '#f5a623', marginLeft: '8px' }}>更新中...</span>}
      </div>
      <div
        style={{
          height: '500px',
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          opacity: isPending ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {flatNodes.map((node) => (
          <div
            key={node.id}
            onClick={() => node.hasChildren && toggle(node.id)}
            style={{
              paddingLeft: `${node.depth * 20 + 8}px`,
              lineHeight: '32px',
              cursor: node.hasChildren ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
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
  )
}
