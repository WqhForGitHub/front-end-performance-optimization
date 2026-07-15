<template>
  <div
    ref="container"
    class="list-container"
    :style="{ height: visibleHeight + 'px', overflowY: 'auto' }"
    @scroll="handleScroll"
  >
    <!-- 撑高容器，模拟完整滚动条 -->
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <!-- 偏移容器，只渲染可见部分 -->
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleData"
          :key="item.id"
          class="list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <span class="idx">#{{ item.id + 1 }}</span>
          <span class="content"> {{ item.name }} - 值: {{ item.value }} - {{ item.desc }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualList',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    itemHeight: {
      type: Number,
      default: 50,
    },
    visibleHeight: {
      type: Number,
      default: 600,
    },
    overscan: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      scrollTop: 0,
    }
  },
  computed: {
    totalHeight() {
      return this.data.length * this.itemHeight
    },
    visibleCount() {
      return Math.ceil(this.visibleHeight / this.itemHeight)
    },
    startIndex() {
      return Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan)
    },
    endIndex() {
      return Math.min(
        this.data.length,
        Math.floor(this.scrollTop / this.itemHeight) + this.visibleCount + this.overscan,
      )
    },
    visibleData() {
      return this.data.slice(this.startIndex, this.endIndex)
    },
    offsetY() {
      return this.startIndex * this.itemHeight
    },
  },
  methods: {
    handleScroll(e) {
      this.scrollTop = e.target.scrollTop
    },
  },
}
</script>
