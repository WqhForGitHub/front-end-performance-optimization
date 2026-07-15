<template>
  <div>
    <div
      :style="{
        paddingLeft: depth * 20 + 8 + 'px',
        lineHeight: '32px',
        cursor: hasChildren ? 'pointer' : 'default',
      }"
      @click="toggle"
    >
      <span style="display: inline-block; width: 20px">
        {{ hasChildren ? (expanded ? '▼' : '▶') : '' }}
      </span>
      {{ node.name }}
    </div>
    <div v-if="expanded && hasChildren">
      <TreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :expanded-keys="expandedKeys"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '../utils/treeData'

// 显式声明组件名，支持递归自引用
defineOptions({ name: 'TreeItem' })

const props = defineProps<{
  node: TreeNode
  depth: number
  expandedKeys: Set<string>
}>()

const emit = defineEmits<{ (e: 'toggle', id: string): void }>()

const expanded = computed(() => props.expandedKeys.has(props.node.id))
const hasChildren = computed(() => !!(props.node.children && props.node.children.length > 0))

function toggle() {
  if (hasChildren.value) {
    emit('toggle', props.node.id)
  }
}
</script>
