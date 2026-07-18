<script setup lang="ts">
import { ref } from 'vue'
import NaiveList from './components/NaiveList.vue'
import VirtualList from './components/VirtualList.vue'
import PaginatedList from './components/PaginatedList.vue'

type Mode = 'naive' | 'virtual' | 'pagination'

const mode = ref<Mode>('virtual')
const dataSize = ref(10000)

const modes: Array<{ key: Mode; label: string; desc: string }> = [
  { key: 'naive', label: '朴素渲染', desc: '一次性渲染全部 DOM，10k 条会卡顿' },
  { key: 'virtual', label: '虚拟滚动', desc: '只渲染可视区域，10w 条流畅' },
  { key: 'pagination', label: '分页加载', desc: '每页 50 条，按需加载' },
]

function switchMode(m: Mode) {
  mode.value = m
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Vue3 - 大量数据渲染优化</h1>
      <p class="subtitle">
        对比朴素渲染、虚拟滚动、分页加载三种方案的渲染性能
      </p>
    </header>

    <section class="control">
      <div class="modes">
        <button
          v-for="m in modes"
          :key="m.key"
          :class="['mode-btn', { active: mode === m.key }]"
          @click="switchMode(m.key)"
        >
          {{ m.label }}
        </button>
      </div>
      <div class="data-size">
        <label>数据量：{{ dataSize.toLocaleString() }} 条</label>
        <select v-model="dataSize">
          <option :value="1000">1,000</option>
          <option :value="10000">10,000</option>
          <option :value="100000">100,000</option>
        </select>
      </div>
      <p class="desc">{{ modes.find((m) => m.key === mode)?.desc }}</p>
    </section>

    <main class="content">
      <NaiveList v-if="mode === 'naive'" :size="Math.min(dataSize, 5000)" />
      <VirtualList v-else-if="mode === 'virtual'" :size="dataSize" />
      <PaginatedList v-else :size="dataSize" />
    </main>

    <footer class="footer">
      <p>提示：朴素渲染建议数据量 &lt;= 5000，否则可能卡顿</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1f2937;
}
.header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #3b82f6;
}
.subtitle {
  color: #6b7280;
  margin: 0 0 20px;
  font-size: 14px;
}
.control {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.modes {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.mode-btn {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
}
.mode-btn.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.data-size {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}
.data-size select {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
.desc {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}
.content {
  min-height: 500px;
}
.footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
}
</style>
