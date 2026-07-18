<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import HeavyChart from './components/HeavyChart.vue'

// 异步组件懒加载（演示 defineAsyncComponent）
const LazyChart = defineAsyncComponent({
  loader: () => import('./components/HeavyChart.vue'),
  loadingComponent: {
    template: '<div class="loading-box">图表组件加载中...</div>',
  },
  errorComponent: {
    template: '<div class="error-box">图表组件加载失败</div>',
  },
  delay: 200,
  timeout: 10000,
})

const showChart = ref(false)
const chartMode = ref<'sync' | 'async'>('async')

// ---- 虚拟滚动：1 万条数据 ----
const TOTAL = 10000
const ITEM_HEIGHT = 48
const VIEWPORT_HEIGHT = 480

const allItems = ref(
  Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    name: `用户 ${i + 1}`,
    age: 18 + (i % 50),
    city: ['北京', '上海', '广州', '深圳', '杭州'][i % 5],
  })),
)

const scrollTop = ref(0)
const viewportRef = ref<HTMLElement | null>(null)

// 计算可视区域起始/结束索引
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / ITEM_HEIGHT)
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT)
  const end = Math.min(start + visibleCount + 2, TOTAL) // 多渲染 2 项缓冲
  return { start, end }
})

const visibleItems = computed(() => {
  const { start, end } = visibleRange.value
  return allItems.value.slice(start, end).map((item) => ({
    ...item,
    _top: (item.id - 1) * ITEM_HEIGHT,
  }))
})

const totalHeight = computed(() => TOTAL * ITEM_HEIGHT)
const renderedCount = computed(() => visibleItems.value.length)
const currentStartIndex = computed(() => visibleRange.value.start + 1)
const currentEndIndex = computed(() => visibleRange.value.end)

let rafId: number | null = null

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    scrollTop.value = target.scrollTop
    rafId = null
  })
}

function scrollToTop() {
  if (viewportRef.value) {
    viewportRef.value.scrollTop = 0
    scrollTop.value = 0
  }
}

function scrollToMiddle() {
  if (viewportRef.value) {
    const target = (TOTAL * ITEM_HEIGHT) / 2 - VIEWPORT_HEIGHT / 2
    viewportRef.value.scrollTop = target
    scrollTop.value = target
  }
}

onMounted(() => {
  console.log(`[VirtualScroll] 初始化 ${TOTAL} 条数据，仅渲染可视区域`)
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>懒加载与虚拟滚动优化</h1>
      <p class="subtitle">异步组件按需加载 + 大列表虚拟滚动，显著降低首屏与渲染开销</p>
    </header>

    <!-- 异步组件懒加载演示 -->
    <section class="card">
      <h2>1. defineAsyncComponent 异步加载</h2>
      <p class="desc">
        通过 <code>defineAsyncComponent</code> 将重型组件拆分为独立 chunk，
        首屏不加载，点击后按需请求。可对比同步/异步两种模式。
      </p>
      <div class="control">
        <label> <input v-model="chartMode" type="radio" value="async" /> 异步加载（懒） </label>
        <label> <input v-model="chartMode" type="radio" value="sync" /> 同步加载（立即） </label>
        <button class="btn primary" @click="showChart = !showChart">
          {{ showChart ? '卸载图表' : '加载图表' }}
        </button>
      </div>
      <div v-if="showChart" class="chart-area">
        <Suspense v-if="chartMode === 'async'">
          <template #default>
            <LazyChart />
          </template>
          <template #fallback>
            <div class="loading-box">图表组件加载中...</div>
          </template>
        </Suspense>
        <HeavyChart v-else />
      </div>
      <p v-if="showChart && chartMode === 'async'" class="tip">
        当前为异步模式：图表代码被拆分为独立 chunk，首次加载会有短暂 loading。
      </p>
      <p v-if="showChart && chartMode === 'sync'" class="tip">
        当前为同步模式：图表代码已包含在主 bundle 中，立即可见。
      </p>
    </section>

    <!-- 虚拟滚动演示 -->
    <section class="card">
      <h2>2. 虚拟滚动 - {{ TOTAL.toLocaleString() }} 条数据</h2>
      <p class="desc">
        即使数据量达 1 万条，DOM 中只渲染可视区域内的 {{ renderedCount }} 条，
        滚动时动态替换，保持流畅。
      </p>

      <div class="stats">
        <div class="stat">
          <span class="stat-label">总数据量</span>
          <span class="stat-value">{{ TOTAL.toLocaleString() }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">实际渲染 DOM</span>
          <span class="stat-value highlight">{{ renderedCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">可视区间</span>
          <span class="stat-value">{{ currentStartIndex }} - {{ currentEndIndex }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">滚动位置</span>
          <span class="stat-value">{{ Math.round(scrollTop) }}px</span>
        </div>
      </div>

      <div class="control">
        <button class="btn" @click="scrollToTop">回到顶部</button>
        <button class="btn" @click="scrollToMiddle">跳到中间</button>
      </div>

      <div
        ref="viewportRef"
        class="viewport"
        :style="{ height: VIEWPORT_HEIGHT + 'px' }"
        @scroll="handleScroll"
      >
        <div class="phantom" :style="{ height: totalHeight + 'px' }">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="row"
            :style="{ height: ITEM_HEIGHT + 'px', transform: `translateY(${item._top}px)` }"
          >
            <span class="row-id">#{{ item.id }}</span>
            <span class="row-name">{{ item.name }}</span>
            <span class="row-age">{{ item.age }} 岁</span>
            <span class="row-city">{{ item.city }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>提示：打开开发者工具 Elements 面板，观察滚动时 DOM 节点数量始终保持在低位。</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
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
}
.card {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}
.card h2 {
  margin: 0 0 8px;
  font-size: 18px;
}
.desc {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 16px;
}
code {
  background: #e0e7ff;
  color: #4338ca;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.control {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.control label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  cursor: pointer;
}
.btn {
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.btn:hover {
  background: #f3f4f6;
}
.btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.chart-area {
  border: 1px dashed #93c5fd;
  border-radius: 6px;
  padding: 12px;
  background: #fff;
}
.loading-box {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}
.tip {
  color: #10b981;
  font-size: 12px;
  margin: 8px 0 0;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.stat {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}
.stat-label {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}
.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
.stat-value.highlight {
  color: #ef4444;
}
.viewport {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow-y: auto;
  background: #fff;
  position: relative;
}
.phantom {
  position: relative;
  width: 100%;
}
.row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}
.row:hover {
  background: #eff6ff;
}
.row-id {
  color: #9ca3af;
  width: 60px;
}
.row-name {
  flex: 1;
  color: #1f2937;
}
.row-age {
  color: #6b7280;
  width: 80px;
}
.row-city {
  color: #3b82f6;
  width: 80px;
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
