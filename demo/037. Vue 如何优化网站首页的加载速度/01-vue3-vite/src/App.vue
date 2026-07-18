<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import HeroSection from './components/HeroSection.vue'

// 优化点 1：异步组件懒加载 - 非首屏内容按需加载
const LazyFeatures = defineAsyncComponent(() => import('./components/FeaturesSection.vue'))
const LazyStats = defineAsyncComponent(() => import('./components/StatsSection.vue'))
const LazyFooter = defineAsyncComponent(() => import('./components/FooterSection.vue'))

// 优化点 2：首屏数据加载状态管理
const loading = ref(true)
const loadTime = ref('')

// 优化点 3：模拟性能数据采集
const perfMetrics = ref({
  fcp: 0,
  lcp: 0,
  domReady: 0,
})

function measurePerformance() {
  setTimeout(() => {
    loading.value = false
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (nav) {
      perfMetrics.value = {
        fcp: Math.round(nav.domContentLoadedEventStart - nav.startTime),
        lcp: Math.round(nav.loadEventEnd - nav.startTime),
        domReady: Math.round(nav.domComplete - nav.startTime),
      }
      loadTime.value = `${perfMetrics.value.lcp}ms`
    }
  }, 200)
}

measurePerformance()
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Vue3 网站首页加载速度优化</h1>
      <p class="subtitle">
        骨架屏 + 异步组件 + 资源预连接 + 代码分割 + 性能监控
      </p>
      <div class="metrics">
        <span class="metric">FCP: <strong>{{ perfMetrics.fcp }}ms</strong></span>
        <span class="metric">LCP: <strong>{{ perfMetrics.lcp }}ms</strong></span>
        <span class="metric">DOM Ready: <strong>{{ perfMetrics.domReady }}ms</strong></span>
      </div>
    </header>

    <!-- 首屏关键内容：同步加载 -->
    <HeroSection />

    <!-- 非首屏内容：异步加载 -->
    <Suspense>
      <template #default>
        <LazyFeatures />
        <LazyStats />
        <LazyFooter />
      </template>
      <template #fallback>
        <div class="loading">加载中...</div>
      </template>
    </Suspense>

    <footer class="footer">
      <p>总加载时间：{{ loadTime || '计算中...' }}</p>
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
  margin: 0 0 16px;
  font-size: 14px;
}
.metrics {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
}
.metric strong {
  color: #3b82f6;
}
.loading {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
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
