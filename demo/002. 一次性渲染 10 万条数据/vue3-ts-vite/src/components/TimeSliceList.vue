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

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { ListItem } from '../utils/data'

const props = withDefaults(
  defineProps<{
    data: ListItem[]
    batchSize?: number
  }>(),
  {
    batchSize: 200,
  },
)

const renderedCount = ref(0)
const isRendering = ref(false)
let rafId: number | null = null

const visibleData = computed(() => props.data.slice(0, renderedCount.value))

function cancelRaf() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function renderBatch() {
  renderedCount.value = Math.min(renderedCount.value + props.batchSize, props.data.length)
  if (renderedCount.value >= props.data.length) {
    isRendering.value = false
    return
  }
  // 让出主线程，下一帧继续渲染下一批
  rafId = requestAnimationFrame(renderBatch)
}

function startRender() {
  cancelRaf()
  renderedCount.value = 0
  isRendering.value = true
  rafId = requestAnimationFrame(renderBatch)
}

watch(
  () => props.data,
  () => {
    startRender()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  cancelRaf()
})
</script>
