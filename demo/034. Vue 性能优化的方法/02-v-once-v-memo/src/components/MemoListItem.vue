<script setup lang="ts">
import { ref, onUpdated } from 'vue'

interface Props {
  id: number
  label: string
  selected: boolean
}

const props = defineProps<Props>()
const renderCount = ref(0)

renderCount.value++

onUpdated(() => {
  renderCount.value++
})
</script>

<template>
  <div :class="['memo-item', { selected: props.selected }]">
    <span class="id">#{{ props.id }}</span>
    <span class="label">{{ props.label }}</span>
    <span class="badge">渲染 {{ renderCount }} 次</span>
  </div>
</template>

<style scoped>
.memo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 6px;
  transition: background 0.15s;
}
.memo-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}
.id {
  color: #9ca3af;
  font-size: 13px;
  min-width: 40px;
}
.label {
  flex: 1;
  color: #1f2937;
}
.badge {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
}
</style>
