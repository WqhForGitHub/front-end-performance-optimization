<template>
  <div>
    <div style="margin-bottom: 12px; color: #888">
      总节点数: {{ totalNodes }} | 已渲染节点数: {{ renderedCount }} / {{ flatNodes.length }} |
      方法: 时间分片（分批渲染）
      <span v-if="isRendering" style="color: #f5a623; margin-left: 8px"> 渲染中... </span>
    </div>
    <div
      :style="{
        height: '500px',
        overflow: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px',
        opacity: isRendering ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }"
    >
      <div
        v-for="node in renderedNodes"
        :key="node.id"
        :style="{
          paddingLeft: node.depth * 20 + 8 + 'px',
          lineHeight: '32px',
          cursor: node.hasChildren ? 'pointer' : 'default',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }"
        @click="toggle(node)"
      >
        <span style="display: inline-block; width: 20px">
          {{ node.hasChildren ? (node.expanded ? '▼' : '▶') : '' }}
        </span>
        {{ node.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { flattenTree, countNodes, type TreeNode, type FlatNode } from '../utils/treeData'

const props = withDefaults(
  defineProps<{
    data: TreeNode[]
    defaultExpandDepth?: number
  }>(),
  {
    defaultExpandDepth: 0,
  },
)

const expandedKeys = ref<Set<string>>(new Set())
const renderedCount = ref(0)
const isRendering = ref(false)
let renderTimer: ReturnType<typeof setTimeout> | null = null

const totalNodes = computed(() => countNodes(props.data))
const flatNodes = computed<FlatNode[]>(() =>
  flattenTree(props.data, expandedKeys.value, props.defaultExpandDepth),
)
const renderedNodes = computed(() => flatNodes.value.slice(0, renderedCount.value))

function startBatchRender() {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
  renderedCount.value = 0
  isRendering.value = true

  const BATCH_SIZE = 200
  const total = flatNodes.value.length

  const renderBatch = () => {
    renderedCount.value = Math.min(renderedCount.value + BATCH_SIZE, total)
    if (renderedCount.value < total) {
      renderTimer = setTimeout(renderBatch, 0)
    } else {
      isRendering.value = false
    }
  }
  renderBatch()
}

watch(flatNodes, () => {
  startBatchRender()
})

onBeforeUnmount(() => {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
})

function toggle(node: FlatNode) {
  if (!node.hasChildren) return
  const next = new Set(expandedKeys.value)
  if (next.has(node.id)) {
    next.delete(node.id)
  } else {
    next.add(node.id)
  }
  expandedKeys.value = next
}
</script>
