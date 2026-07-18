<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Item {
  id: number
  name: string
  value: number
}

const props = defineProps<{ size: number }>()

const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 500
const BUFFER = 5

const allData = ref<Item[]>([])
const scrollTop = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const renderTime = ref(0)

// 只渲染可视区域 + 上下缓冲
const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER)
  const end = Math.min(
    allData.value.length,
    start + Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + BUFFER * 2,
  )
  return allData.value.slice(start, end).map((item, i) => ({
    ...item,
    _top: (start + i) * ITEM_HEIGHT,
  }))
})

const totalHeight = computed(() => allData.value.length * ITEM_HEIGHT)

let rafId = 0
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    scrollTop.value = target.scrollTop
  })
}

function generate() {
  const start = performance.now()
  allData.value = Array.from({ length: props.size }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
  }))
  renderTime.value = Math.round(performance.now() - start)
}

onMounted(generate)
onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="virtual">
    <div class="info">
      <span>总数量：{{ allData.length.toLocaleString() }}</span>
      <span>实际渲染 DOM：{{ visibleItems.length }}</span>
      <span>渲染耗时：{{ renderTime }}ms</span>
    </div>
    <div
      ref="containerRef"
      class="viewport"
      :style="{ height: VIEWPORT_HEIGHT + 'px' }"
      @scroll="handleScroll"
    >
      <div class="phantom" :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="item"
          :style="{
            height: ITEM_HEIGHT + 'px',
            position: 'absolute',
            top: item._top + 'px',
            width: '100%',
          }"
        >
          <span class="id">#{{ item.id }}</span>
          <span class="name">{{ item.name }}</span>
          <span class="value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual {
  font-family: system-ui, sans-serif;
}
.info {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #dcfce7;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #166534;
}
.viewport {
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.phantom {
  width: 100%;
}
.item {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  align-items: center;
  box-sizing: border-box;
  background: #fff;
}
.id {
  color: #9ca3af;
  min-width: 60px;
}
.name {
  flex: 1;
  color: #1f2937;
}
.value {
  color: #3b82f6;
  font-weight: 600;
}
</style>
