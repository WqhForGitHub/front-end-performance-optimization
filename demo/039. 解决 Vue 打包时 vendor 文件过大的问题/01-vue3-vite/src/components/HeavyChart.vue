<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟重型图表组件 - 异步加载，独立成 chunk
const data = ref<number[]>([])

onMounted(() => {
  // 模拟数据生成
  data.value = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
})
</script>

<template>
  <div class="chart">
    <h4>月度访问趋势（异步加载）</h4>
    <div class="bars">
      <div
        v-for="(v, i) in data"
        :key="i"
        class="bar"
        :style="{ height: v + '%' }"
        :title="`${v}%`"
      ></div>
    </div>
    <div class="labels">
      <span v-for="(v, i) in data" :key="i">{{ i + 1 }}月</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  font-family: system-ui, sans-serif;
}
.chart h4 {
  margin: 0 0 12px;
  color: #3b82f6;
  font-size: 14px;
}
.bars {
  display: flex;
  gap: 4px;
  height: 160px;
  align-items: flex-end;
}
.bar {
  flex: 1;
  min-width: 16px;
  background: linear-gradient(180deg, #3b82f6, #93c5fd);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}
.labels {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
.labels span {
  flex: 1;
  min-width: 16px;
  text-align: center;
  font-size: 10px;
  color: #6b7280;
}
</style>
