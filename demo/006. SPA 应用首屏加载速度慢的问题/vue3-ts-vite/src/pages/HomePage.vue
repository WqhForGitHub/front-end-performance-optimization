<template>
  <div>
    <h3 style="margin-bottom: 12px">首页</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px">
      <div
        v-for="item in data"
        :key="item.id"
        style="padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 14px"
      >
        <div style="font-weight: 600; margin-bottom: 4px">{{ item.title }}</div>
        <div style="color: #999">数值: {{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface HomeItem {
  id: number
  title: string
  value: number
}

const data = ref<HomeItem[]>([])

const items: HomeItem[] = []
for (let i = 0; i < 20; i++) {
  items.push({
    id: i,
    title: `首页内容 ${i + 1}`,
    value: Math.round(Math.random() * 1000),
  })
}
data.value = items
</script>
