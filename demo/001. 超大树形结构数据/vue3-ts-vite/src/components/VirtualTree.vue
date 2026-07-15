<template>
  <div>
    <div style="margin-bottom: 12px; color: #888">
      总节点数: {{ totalNodes }} | 可见(扁平化)节点数: {{ flatNodes.length }} | 实际渲染DOM数:
      {{ visibleNodes.length }} | 方法: 虚拟列表
    </div>
    <div
      ref="containerRef"
      :style="{
        height: viewportHeight + 'px',
        overflow: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px',
        position: 'relative',
      }"
      @scroll="handleScroll"
    >
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div :style="{ transform: `translateY(${offsetY}px)` }">
          <div
            v-for="node in visibleNodes"
            :key="node.id"
            :style="{
              height: itemHeight + 'px',
              paddingLeft: node.depth * 20 + 8 + 'px',
              lineHeight: itemHeight + 'px',
              cursor: node.hasChildren ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { flattenTree, countNodes, type TreeNode, type FlatNode } from '../utils/treeData'

const props = withDefaults(
  defineProps<{
    data: TreeNode[]
    defaultExpandDepth?: number
    itemHeight?: number
    viewportHeight?: number
  }>(),
  {
    defaultExpandDepth: 0,
    itemHeight: 32,
    viewportHeight: 500,
  },
)

const containerRef = ref<HTMLDivElement>()
const expandedKeys = ref<Set<string>>(new Set())
const scrollTop = ref(0)

const totalNodes = computed(() => countNodes(props.data))
const flatNodes = computed<FlatNode[]>(() =>
  flattenTree(props.data, expandedKeys.value, props.defaultExpandDepth),
)

const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
const endIndex = computed(() =>
  Math.min(
    startIndex.value + Math.ceil(props.viewportHeight / props.itemHeight) + 5,
    flatNodes.value.length,
  ),
)
const visibleNodes = computed(() => flatNodes.value.slice(startIndex.value, endIndex.value))
const totalHeight = computed(() => flatNodes.value.length * props.itemHeight)
const offsetY = computed(() => startIndex.value * props.itemHeight)

function handleScroll() {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

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
