<template>
  <div
    ref="containerRef"
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ListItem } from '../utils/data'

const props = withDefaults(
  defineProps<{
    data: ListItem[]
    itemHeight?: number
    visibleHeight?: number
    overscan?: number
  }>(),
  {
    itemHeight: 50,
    visibleHeight: 600,
    overscan: 5,
  },
)

const containerRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)

const totalHeight = computed(() => props.data.length * props.itemHeight)
const visibleCount = computed(() => Math.ceil(props.visibleHeight / props.itemHeight))
const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan),
)
const endIndex = computed(() =>
  Math.min(
    props.data.length,
    Math.floor(scrollTop.value / props.itemHeight) + visibleCount.value + props.overscan,
  ),
)
const visibleData = computed(() => props.data.slice(startIndex.value, endIndex.value))
const offsetY = computed(() => startIndex.value * props.itemHeight)

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLDivElement).scrollTop
}
</script>
