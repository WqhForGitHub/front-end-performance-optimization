<template>
  <div>
    <h3 style="margin-bottom: 12px">数据仪表盘</h3>
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px"
    >
      <div
        v-for="stat in stats"
        :key="stat.id"
        style="padding: 16px; background: #f5f5f5; border-radius: 6px; text-align: center"
      >
        <div style="font-size: 12px; color: #999; margin-bottom: 4px">{{ stat.label }}</div>
        <div style="font-size: 20px; font-weight: 700; font-family: monospace">
          {{ stat.value }}
          <span
            :style="{
              fontSize: '12px',
              color: stat.trend === '↑' ? '#52c41a' : '#ff4d4f',
              marginLeft: '4px',
            }"
          >
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </div>
    <div
      style="
        padding: 16px;
        background: #f5f5f5;
        border-radius: 6px;
        height: 150px;
        display: flex;
        align-items: flex-end;
        gap: 4px;
      "
    >
      <div
        v-for="(h, i) in chartBars"
        :key="i"
        :style="{
          flex: 1,
          height: h + '%',
          background: `hsl(${210 + i * 3}, 70%, ${50 + i}%)`,
          borderRadius: '2px',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface StatItem {
  id: number
  label: string
  value: number
  trend: string
}

const stats = ref<StatItem[]>([])
const chartBars = ref<number[]>([])

const labels = ['总用户数', '日活跃用户', '页面访问量', '平均加载时间', '错误率', '转化率']
const items: StatItem[] = []
for (let i = 0; i < labels.length; i++) {
  const value = Math.round(Math.random() * 10000)
  items.push({
    id: i,
    label: labels[i],
    value,
    trend: value > 5000 ? '↑' : '↓',
  })
}
stats.value = items
chartBars.value = Array.from({ length: 30 }, () => 20 + Math.random() * 80)
</script>
