<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 800px; margin: 0 auto">
    <h2>Vue3 + TS + Vite - SPA 首屏加载优化</h2>
    <p style="color: #888; font-size: 14px; margin-bottom: 20px">
      SPA 应用首屏加载慢的根因：所有页面代码打包在一个 JS 文件中，首次加载时需要下载和解析全部代码。
    </p>

    <!-- 方法切换 Tab -->
    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :style="{
          padding: '8px 16px',
          background: method === tab.key ? '#1677ff' : '#fff',
          color: method === tab.key ? '#fff' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }"
        @click="switchMethod(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      style="
        margin-bottom: 16px;
        padding: 10px 16px;
        background: #f5f5f5;
        border-radius: 6px;
        color: #666;
        font-size: 14px;
      "
    >
      {{ currentDesc }}
      <span v-if="method === 'prefetch' && prefetched" style="color: #52c41a; margin-left: 8px"
        >✓ 已预取其他页面</span
      >
    </div>

    <!-- 页面导航 -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button
        v-for="page in pages"
        :key="page.key"
        :style="{
          padding: '6px 14px',
          background: currentPage === page.key ? '#333' : '#fff',
          color: currentPage === page.key ? '#fff' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }"
        @click="currentPage = page.key"
      >
        {{ page.label }}
      </button>
    </div>

    <!-- 页面内容区域 -->
    <div
      style="
        padding: 20px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        background: #fff;
        min-height: 300px;
      "
    >
      <!-- 方法一：直接加载 -->
      <template v-if="method === 'direct'">
        <HomePage v-if="currentPage === 'home'" />
        <AboutPage v-else-if="currentPage === 'about'" />
        <DashboardPage v-else-if="currentPage === 'dashboard'" />
      </template>

      <!-- 方法二：懒加载 + loading 文字 -->
      <template v-else-if="method === 'lazy'">
        <HomePage v-if="currentPage === 'home'" />
        <component :is="lazyAbout" v-else-if="currentPage === 'about'" />
        <component :is="lazyDashboard" v-else-if="currentPage === 'dashboard'" />
      </template>

      <!-- 方法三：懒加载 + 骨架屏 -->
      <template v-else-if="method === 'lazySkeleton'">
        <HomePage v-if="currentPage === 'home'" />
        <component :is="lazyAboutSkeleton" v-else-if="currentPage === 'about'" />
        <component :is="lazyDashboardSkeleton" v-else-if="currentPage === 'dashboard'" />
      </template>

      <!-- 方法四：预加载 -->
      <template v-else-if="method === 'prefetch'">
        <HomePage v-if="currentPage === 'home'" />
        <component :is="lazyAboutSkeleton" v-else-if="currentPage === 'about'" />
        <component :is="lazyDashboardSkeleton" v-else-if="currentPage === 'dashboard'" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue'
import HomePage from './pages/HomePage.vue'
import AboutPage from './pages/AboutPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import SkeletonPage from './components/SkeletonPage.vue'

type Method = 'direct' | 'lazy' | 'lazySkeleton' | 'prefetch'
type PageName = 'home' | 'about' | 'dashboard'

const method = ref<Method>('lazySkeleton')
const currentPage = ref<PageName>('home')
const prefetched = ref(false)

const tabs: { key: Method; label: string; desc: string }[] = [
  {
    key: 'direct',
    label: '方法一: 直接加载',
    desc: '所有页面静态导入，首屏加载慢但切换快（baseline）',
  },
  {
    key: 'lazy',
    label: '方法二: 路由懒加载',
    desc: '页面按需加载，首屏只加载首页，减小初始包体积',
  },
  {
    key: 'lazySkeleton',
    label: '方法三: 懒加载+骨架屏',
    desc: '懒加载 + 骨架屏占位，加载期间不白屏',
  },
  {
    key: 'prefetch',
    label: '方法四: 预加载',
    desc: '首页静态导入，空闲时预取其他页面，兼顾首屏和切换',
  },
]

const pages: { key: PageName; label: string }[] = [
  { key: 'home', label: '首页' },
  { key: 'about', label: '关于' },
  { key: 'dashboard', label: '仪表盘' },
]

const currentDesc = computed(() => tabs.find((t) => t.key === method.value)?.desc ?? '')

// 方法二：懒加载组件（简单 loading 文字）
const lazyAbout = defineAsyncComponent(() => import('./pages/AboutPage.vue'))
const lazyDashboard = defineAsyncComponent(() => import('./pages/DashboardPage.vue'))

// 方法三/四：懒加载组件 + 骨架屏
const lazyAboutSkeleton = defineAsyncComponent({
  loader: () => import('./pages/AboutPage.vue'),
  loadingComponent: SkeletonPage,
  delay: 0,
})
const lazyDashboardSkeleton = defineAsyncComponent({
  loader: () => import('./pages/DashboardPage.vue'),
  loadingComponent: SkeletonPage,
  delay: 0,
})

function switchMethod(key: Method) {
  method.value = key
}

// 方法四：空闲时预取其他页面
function startPrefetch() {
  if (method.value !== 'prefetch' || prefetched.value) return

  const doPrefetch = () => {
    if (method.value !== 'prefetch' || prefetched.value) return
    import('./pages/AboutPage.vue')
    import('./pages/DashboardPage.vue')
    prefetched.value = true
    console.log('[预加载] 已在空闲时间预取 About 和 Dashboard 页面')
  }

  if ('requestIdleCallback' in window) {
    ;(window as Window).requestIdleCallback(doPrefetch, { timeout: 3000 })
  } else {
    setTimeout(doPrefetch, 1000)
  }
}

// 监听方法变化，切换到预加载时触发预取
watch(method, (newMethod) => {
  currentPage.value = 'home'
  prefetched.value = false
  if (newMethod === 'prefetch') {
    startPrefetch()
  }
})

onMounted(() => {
  if (method.value === 'prefetch') {
    startPrefetch()
  }
})
</script>
