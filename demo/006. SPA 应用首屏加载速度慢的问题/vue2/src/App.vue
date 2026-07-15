<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 800px; margin: 0 auto">
    <h2>Vue2 - SPA 首屏加载优化</h2>
    <p style="color: #888; font-size: 14px; margin-bottom: 20px">
      SPA 应用首屏加载慢的根因：所有页面代码打包在一个 JS 文件中，首次加载时需要下载和解析全部代码。
    </p>

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
      <HomePage v-if="method === 'direct' && currentPage === 'home'" />
      <AboutPage v-if="method === 'direct' && currentPage === 'about'" />
      <DashboardPage v-if="method === 'direct' && currentPage === 'dashboard'" />

      <!-- 方法二：懒加载 + loading 文字 -->
      <div
        v-if="method === 'lazy' && aboutLoading"
        style="padding: 40px; text-align: center; color: #999"
      >
        加载中...
      </div>
      <div
        v-if="method === 'lazy' && dashboardLoading"
        style="padding: 40px; text-align: center; color: #999"
      >
        加载中...
      </div>

      <!-- 方法三/四：懒加载 + 骨架屏 -->
      <SkeletonPage v-if="(method === 'lazySkeleton' || method === 'prefetch') && aboutLoading" />
      <SkeletonPage
        v-if="(method === 'lazySkeleton' || method === 'prefetch') && dashboardLoading"
      />

      <!-- 动态组件渲染 -->
      <component :is="currentComponent" v-if="method !== 'direct'" />
    </div>
  </div>
</template>

<script>
import HomePage from './pages/HomePage.vue'
import AboutPage from './pages/AboutPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import SkeletonPage from './components/SkeletonPage.vue'

export default {
  name: 'App',
  components: { HomePage, AboutPage, DashboardPage, SkeletonPage },
  data() {
    return {
      method: 'lazySkeleton',
      currentPage: 'home',
      prefetched: false,
      aboutLoading: false,
      dashboardLoading: false,
      lazyAbout: null,
      lazyDashboard: null,
      tabs: [
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
      ],
      pages: [
        { key: 'home', label: '首页' },
        { key: 'about', label: '关于' },
        { key: 'dashboard', label: '仪表盘' },
      ],
    }
  },
  computed: {
    currentDesc() {
      var tab = this.tabs.find((t) => t.key === this.method)
      return tab ? tab.desc : ''
    },
    currentComponent() {
      if (this.method === 'direct') return null
      if (this.currentPage === 'home') return 'HomePage'
      if (this.currentPage === 'about' && this.lazyAbout) return this.lazyAbout
      if (this.currentPage === 'dashboard' && this.lazyDashboard) return this.lazyDashboard
      return null
    },
  },
  watch: {
    method() {
      this.currentPage = 'home'
      this.prefetched = false
    },
    currentPage(newPage) {
      if (this.method === 'direct') return
      if (newPage === 'about' && !this.lazyAbout) {
        this.loadAbout()
      }
      if (newPage === 'dashboard' && !this.lazyDashboard) {
        this.loadDashboard()
      }
    },
  },
  mounted() {
    this.startPrefetch()
  },
  methods: {
    switchMethod(key) {
      this.method = key
    },
    loadAbout() {
      this.aboutLoading = true
      // 动态导入组件
      import('./pages/AboutPage.vue').then((module) => {
        this.lazyAbout = module.default
        this.aboutLoading = false
      })
    },
    loadDashboard() {
      this.dashboardLoading = true
      import('./pages/DashboardPage.vue').then((module) => {
        this.lazyDashboard = module.default
        this.dashboardLoading = false
      })
    },
    startPrefetch() {
      // 方法四：空闲时预取
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var self = this
      var doPrefetch = function () {
        if (self.method !== 'prefetch' || self.prefetched) return
        import('./pages/AboutPage.vue')
        import('./pages/DashboardPage.vue')
        self.prefetched = true
        console.log('[预加载] 已在空闲时间预取 About 和 Dashboard 页面')
      }

      // 监听 method 变化后也需要触发
      this.$watch('method', function (newMethod) {
        if (newMethod === 'prefetch' && !self.prefetched) {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(doPrefetch, { timeout: 3000 })
          } else {
            setTimeout(doPrefetch, 1000)
          }
        }
      })
    },
  },
}
</script>
