<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟数据请求 - 异步组件加载时才请求
const stats = ref([
  { label: '活跃用户', value: 0, target: 128000 },
  { label: '日均访问', value: 0, target: 89000 },
  { label: '满意度', value: 0, target: 98 },
])

onMounted(() => {
  // 数字滚动动画
  stats.value.forEach((s) => {
    const duration = 1000
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      s.value = Math.floor(s.target * progress)
      if (progress < 1) requestAnimationFrame(tick)
    }
    tick()
  })
})

function formatValue(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`
  return `${v}%`
}
</script>

<template>
  <section class="stats">
    <h2>数据统计（异步加载）</h2>
    <div class="grid">
      <div v-for="s in stats" :key="s.label" class="stat">
        <div class="value">{{ formatValue(s.value) }}</div>
        <div class="label">{{ s.label }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  margin-bottom: 24px;
}
.stats h2 {
  margin: 0 0 16px;
  color: #3b82f6;
  font-size: 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat {
  padding: 20px;
  background: #ecfdf5;
  border-radius: 8px;
  text-align: center;
}
.value {
  font-size: 28px;
  font-weight: 700;
  color: #15803d;
}
.label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}
</style>
