<template>
  <div>
    <div style="margin-bottom: 12px; color: #888">
      总节点数: {{ totalNodes }} | 可见(扁平化)节点数: {{ flatNodes.length }} | 实际渲染DOM数:
      {{ visibleNodes.length }} | 方法: 虚拟列表
    </div>
    <div
      ref="container"
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
        <div :style="{ transform: 'translateY(' + offsetY + 'px)' }">
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

<script>
import { flattenTree, countNodes } from '../utils/treeData'

export default {
  name: 'VirtualTree',
  props: {
    data: { type: Array, required: true },
    defaultExpandDepth: { type: Number, default: 0 },
    itemHeight: { type: Number, default: 32 },
    viewportHeight: { type: Number, default: 500 },
  },
  data() {
    return {
      expandedKeys: new Set(),
      scrollTop: 0,
    }
  },
  computed: {
    totalNodes() {
      return countNodes(this.data)
    },
    flatNodes() {
      return flattenTree(this.data, this.expandedKeys, this.defaultExpandDepth)
    },
    startIndex() {
      return Math.floor(this.scrollTop / this.itemHeight)
    },
    endIndex() {
      return Math.min(
        this.startIndex + Math.ceil(this.viewportHeight / this.itemHeight) + 5,
        this.flatNodes.length,
      )
    },
    visibleNodes() {
      return this.flatNodes.slice(this.startIndex, this.endIndex)
    },
    totalHeight() {
      return this.flatNodes.length * this.itemHeight
    },
    offsetY() {
      return this.startIndex * this.itemHeight
    },
  },
  methods: {
    handleScroll() {
      this.scrollTop = this.$refs.container.scrollTop
    },
    toggle(node) {
      if (!node.hasChildren) return
      const next = new Set(this.expandedKeys)
      if (next.has(node.id)) {
        next.delete(node.id)
      } else {
        next.add(node.id)
      }
      this.expandedKeys = next
    },
  },
}
</script>
