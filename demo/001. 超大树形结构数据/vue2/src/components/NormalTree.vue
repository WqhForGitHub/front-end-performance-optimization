<template>
  <div>
    <div style="margin-bottom: 12px; color: #888">
      总节点数: {{ totalNodes }} | 方法: 直接递归渲染（不推荐，节点多会卡死）
    </div>
    <div
      :style="{ height: '500px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px' }"
    >
      <tree-node
        v-for="node in data"
        :key="node.id"
        :node="node"
        :depth="0"
        :expanded-keys="expandedKeys"
        @toggle="toggle"
      />
    </div>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue'
import { countNodes } from '../utils/treeData'

export default {
  name: 'NormalTree',
  components: { TreeNode },
  props: {
    data: { type: Array, required: true },
  },
  data() {
    return {
      expandedKeys: new Set(),
    }
  },
  computed: {
    totalNodes() {
      return countNodes(this.data)
    },
  },
  methods: {
    toggle(id) {
      const next = new Set(this.expandedKeys)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      // Vue2 对 Set 响应式支持不好，需要重新赋值
      this.expandedKeys = next
    },
  },
}
</script>
