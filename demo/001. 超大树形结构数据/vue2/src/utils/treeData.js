/**
 * 树形数据结构定义与工具函数（Vue2 版本）
 */

/**
 * 生成超大树形结构数据
 * @param {number} depth 树的深度
 * @param {number} breadth 每层子节点数量
 * @returns {Array} 树形数组
 */
export function generateBigTree(depth = 4, breadth = 10) {
  let idCounter = 0

  function generate(parentLevel, parentId) {
    const nodes = []
    for (let i = 0; i < breadth; i++) {
      const id = `${parentId ? parentId + '-' : ''}${i}`
      const node = { id, name: `节点-${id}` }
      idCounter++
      if (parentLevel < depth - 1) {
        node.children = generate(parentLevel + 1, id)
      }
      nodes.push(node)
    }
    return nodes
  }

  const result = generate(0, null)
  console.log(`[数据生成] 共生成 ${idCounter} 个节点`)
  return result
}

/**
 * 将树形数据扁平化为一维数组（只包含可见节点）
 * @param {Array} tree 树形数据
 * @param {Set} expandedKeys 展开的节点 id 集合
 * @param {number} defaultExpandDepth 默认展开层级
 */
export function flattenTree(tree, expandedKeys, defaultExpandDepth = 0) {
  const result = []

  function walk(nodes, depth, parentId) {
    for (const node of nodes) {
      const expanded = expandedKeys.has(node.id) || depth < defaultExpandDepth
      result.push({
        id: node.id,
        name: node.name,
        depth,
        hasChildren: !!(node.children && node.children.length > 0),
        expanded,
        parentId,
      })
      if (expanded && node.children) {
        walk(node.children, depth + 1, node.id)
      }
    }
  }

  walk(tree, 0, null)
  return result
}

/** 统计树节点总数 */
export function countNodes(tree) {
  let count = 0
  function walk(nodes) {
    for (const node of nodes) {
      count++
      if (node.children) walk(node.children)
    }
  }
  walk(tree)
  return count
}
