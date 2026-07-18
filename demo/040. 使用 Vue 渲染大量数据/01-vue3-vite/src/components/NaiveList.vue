<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Item {
  id: number
  name: string
  value: number
}

const props = defineProps<{ size: number }>()

const items = ref<Item[]>([])
const renderTime = ref(0)

function generate() {
  const start = performance.now()
  items.value = Array.from({ length: props.size }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
  }))
  renderTime.value = Math.round(performance.now() - start)
}

onMounted(generate)
</script>

<template>
  <div class="naive">
    <div class="info">
      <span>渲染数量：{{ items.length }}</span>
      <span>渲染耗时：{{ renderTime }}ms</span>
    </div>
    <div class="list">
      <div v-for="item in items" :key="item.id" class="item">
        <span class="id">#{{ item.id }}</span>
        <span class="name">{{ item.name }}</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.naive {
  font-family: system-ui, sans-serif;
}
.info {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #991b1b;
}
.list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.item {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
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
