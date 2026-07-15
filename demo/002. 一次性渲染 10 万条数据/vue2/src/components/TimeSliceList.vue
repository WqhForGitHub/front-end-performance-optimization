<template>
  <div>
    <div class="status" style="margin-bottom: 8px">
      已渲染 {{ renderedCount.toLocaleString() }} / {{ data.length.toLocaleString() }} 条
      <span v-if="isRendering"> · 渲染中...</span>
    </div>
    <div class="list-container">
      <div v-for="item in visibleData" :key="item.id" class="list-item">
        <span class="idx">#{{ item.id + 1 }}</span>
        <span class="content"> {{ item.name }} - 值: {{ item.value }} - {{ item.desc }} </span>
      </div>
      <div v-if="isRendering" class="loading">加载更多数据...</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeSliceList',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    batchSize: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      renderedCount: 0,
      isRendering: false,
      rafId: null,
    }
  },
  computed: {
    visibleData() {
      return this.data.slice(0, this.renderedCount)
    },
  },
  watch: {
    data: {
      handler() {
        this.startRender()
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.cancelRaf()
  },
  methods: {
    startRender() {
      this.cancelRaf()
      this.renderedCount = 0
      this.isRendering = true
      this.renderBatch()
    },
    renderBatch() {
      this.renderedCount = Math.min(this.renderedCount + this.batchSize, this.data.length)
      if (this.renderedCount >= this.data.length) {
        this.isRendering = false
        return
      }
      // 让出主线程，下一帧继续渲染下一批
      this.rafId = requestAnimationFrame(this.renderBatch)
    },
    cancelRaf() {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId)
        this.rafId = null
      }
    },
  },
}
</script>
