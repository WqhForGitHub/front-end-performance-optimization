<template>
  <div>
    <div style="margin-bottom: 12px; color: #888">
      总节点数: {{ totalNodes }} | 方法: 直接递归渲染（不推荐，节点多会卡死）
    </div>
    <div :style="viewportStyle">
      <TreeItem
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import TreeItem from './TreeItem.vue'
import { countNodes, type TreeNode } from '../utils/treeData'

const props = defineProps<{ data: TreeNode[] }>()

const expandedKeys = ref<Set<string>>(new Set())
const totalNodes = computed(() => countNodes(props.data))

const viewportStyle = {
  height: '500px',
  overflow: 'auto',
  border: '1px solid #ddd',
  borderRadius: '4px',
}

function toggle(id: string) {
  const next = new Set(expandedKeys.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedKeys.value = next
}
</script>
