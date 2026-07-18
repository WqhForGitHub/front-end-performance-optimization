<script setup lang="ts">
import { ref } from 'vue'

// 模拟一个较重的图表组件（懒加载后才执行）
const data = ref<number[]>(Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 100)))

const labels = ref<string[]>(Array.from({ length: 12 }, (_, i) => `${i + 1}月`))

const maxVal = Math.max(...data.value)
</script>

<template>
  <div class="chart">
    <h4>异步加载的图表组件</h4>
    <p class="desc">此组件通过 defineAsyncComponent 懒加载，仅在需要时才请求 JS 资源。</p>
    <div class="bars">
      <div v-for="(val, i) in data" :key="i" class="bar-wrap">
        <div
          class="bar"
          :style="{ height: (val / maxVal) * 100 + '%' }"
          :title="`${labels[i]}: ${val}`"
        ></div>
        <span class="bar-label">{{ labels[i] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}
.chart h4 {
  margin: 0 0 4px;
  color: #1f2937;
}
.desc {
  color: #6b7280;
  font-size: 12px;
  margin: 0 0 12px;
}
.bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 140px;
}
.bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 100%;
  background: linear-gradient(180deg, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}
.bar-label {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}
</style>
