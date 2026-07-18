<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Item {
  id: number
  name: string
  value: number
}

const props = defineProps<{ size: number }>()

const PAGE_SIZE = 50
const allData = ref<Item[]>([])
const currentPage = ref(1)
const renderTime = ref(0)

const totalPages = computed(() => Math.ceil(allData.value.length / PAGE_SIZE))

const pageData = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return allData.value.slice(start, start + PAGE_SIZE)
})

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
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
</script>

<template>
  <div class="pagination">
    <div class="info">
      <span>总数量：{{ allData.length.toLocaleString() }}</span>
      <span>当前页：{{ currentPage }} / {{ totalPages }}</span>
      <span>渲染耗时：{{ renderTime }}ms</span>
    </div>
    <div class="list">
      <div v-for="item in pageData" :key="item.id" class="item">
        <span class="id">#{{ item.id }}</span>
        <span class="name">{{ item.name }}</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>
    <div class="pager">
      <button :disabled="currentPage === 1" @click="goToPage(1)">首页</button>
      <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
      <button :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
        末页
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  font-family: system-ui, sans-serif;
}
.info {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #dbeafe;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #1e40af;
}
.list {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
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
.pager {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.pager button {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.pager button:disabled {
  background: #f9fafb;
  color: #d1d5db;
  cursor: not-allowed;
}
.page-info {
  font-size: 13px;
  color: #6b7280;
  min-width: 80px;
  text-align: center;
}
</style>
