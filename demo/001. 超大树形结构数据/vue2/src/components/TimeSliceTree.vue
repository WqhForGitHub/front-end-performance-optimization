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

<script>
import { flattenTree, countNodes } from '../utils/treeData'

export default {
  name: 'TimeSliceTree',
  props: {
    data: { type: Array, required: true },
    defaultExpandDepth: { type: Number, default: 0 },
  },
  data() {
    return {
      expandedKeys: new Set(),
      renderedCount: 0, // 已渲染节点数
      isRendering: false,
      renderTimer: null,
    }
  },
  computed: {
    totalNodes() {
      return countNodes(this.data)
    },
    flatNodes() {
      return flattenTree(this.data, this.expandedKeys, this.defaultExpandDepth)
    },
    // 只取已渲染的节点
    renderedNodes() {
      return this.flatNodes.slice(0, this.renderedCount)
    },
  },
  watch: {
    flatNodes() {
      // 数据变化时重新分批渲染
      this.startBatchRender()
    },
  },
  beforeDestroy() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer)
    }
  },
  methods: {
    startBatchRender() {
      // 取消上一次的渲染
      if (this.renderTimer) {
        clearTimeout(this.renderTimer)
      }
      this.renderedCount = 0
      this.isRendering = true

      // 每帧渲染 BATCH_SIZE 个节点
      const BATCH_SIZE = 200
      const total = this.flatNodes.length

      const renderBatch = () => {
        this.renderedCount = Math.min(this.renderedCount + BATCH_SIZE, total)
        if (this.renderedCount < total) {
          // 用 requestAnimationFrame 让浏览器有机会响应交互
          this.renderTimer = setTimeout(renderBatch, 0)
        } else {
          this.isRendering = false
        }
      }
      renderBatch()
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
