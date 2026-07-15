// 树形数据结构定义
export interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

// 扁平化后的节点结构（用于虚拟列表）
export interface FlatNode {
  id: string
  name: string
  depth: number
  hasChildren: boolean
  expanded: boolean
  parentId: string | null
}

/**
 * 生成超大树形结构数据
 * @param depth 树的深度
 * @param breadth 每层子节点数量
 */
export function generateBigTree(depth: number = 4, breadth: number = 10): TreeNode[] {
  const result: TreeNode[] = []
  let idCounter = 0

  function generate(parentLevel: number, parentId: string | null): TreeNode[] {
    const nodes: TreeNode[] = []
    for (let i = 0; i < breadth; i++) {
      const id = `${parentId ? parentId + '-' : ''}${i}`
      const node: TreeNode = {
        id,
        name: `节点-${id}`,
      }
      idCounter++
      if (parentLevel < depth - 1) {
        node.children = generate(parentLevel + 1, id)
      }
      nodes.push(node)
    }
    return nodes
  }

  result.push(...generate(0, null))
  console.log(`[数据生成] 共生成 ${idCounter} 个节点`)
  return result
}

/**
 * 将树形数据扁平化为一维数组
 * 只包含可见节点（根据 expanded 状态）
 */
export function flattenTree(
  tree: TreeNode[],
  expandedKeys: Set<string>,
  defaultExpandDepth: number = 0,
): FlatNode[] {
  const result: FlatNode[] = []

  function walk(nodes: TreeNode[], depth: number, parentId: string | null) {
    for (const node of nodes) {
      const expanded = expandedKeys.has(node.id) || depth < defaultExpandDepth
      const flatNode: FlatNode = {
        id: node.id,
        name: node.name,
        depth,
        hasChildren: !!(node.children && node.children.length > 0),
        expanded,
        parentId,
      }
      result.push(flatNode)
      if (expanded && node.children) {
        walk(node.children, depth + 1, node.id)
      }
    }
  }

  walk(tree, 0, null)
  return result
}

/** 统计树节点总数 */
export function countNodes(tree: TreeNode[]): number {
  let count = 0
  function walk(nodes: TreeNode[]) {
    for (const node of nodes) {
      count++
      if (node.children) walk(node.children)
    }
  }
  walk(tree)
  return count
}
