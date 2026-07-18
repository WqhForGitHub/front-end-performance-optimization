<template>
  <div class="app">
    <header class="header">
      <h2>Vue2 - 网站首页加载速度优化</h2>
      <p class="subtitle">
        骨架屏 + 异步组件 + 资源预连接 + 代码分割 + 性能监控
      </p>
      <div class="metrics">
        <span class="metric">FCP: <strong>{{ metrics.fcp }}ms</strong></span>
        <span class="metric">LCP: <strong>{{ metrics.lcp }}ms</strong></span>
        <span class="metric">DOM Ready: <strong>{{ metrics.domReady }}ms</strong></span>
      </div>
    </header>

    <!-- 首屏关键内容：同步加载 -->
    <section class="hero">
      <h3>首屏关键内容（同步加载）</h3>
      <p class="desc">Hero 区域是首屏 LCP 的关键元素，必须同步加载以保证快速渲染。</p>
      <div class="cta">
        <button class="btn-primary">立即开始</button>
        <button class="btn-secondary">了解更多</button>
      </div>
    </section>

    <!-- 非首屏内容：异步加载 -->
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <section class="features">
        <h3>功能特性（异步加载）</h3>
        <div class="grid">
          <div v-for="f in features" :key="f.title" class="card">
            <div class="icon">{{ f.icon }}</div>
            <h4>{{ f.title }}</h4>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <section class="stats">
        <h3>数据统计（异步加载）</h3>
        <div class="stat-grid">
          <div v-for="s in stats" :key="s.label" class="stat">
            <div class="value">{{ s.value }}</div>
            <div class="label">{{ s.label }}</div>
          </div>
        </div>
      </section>

      <section class="footer-section">
        <div class="links">
          <a href="#">关于我们</a>
          <a href="#">联系方式</a>
          <a href="#">隐私政策</a>
          <a href="#">服务条款</a>
        </div>
        <p class="copyright">© 2024 Vue2 首页优化示例. All rights reserved.</p>
      </section>
    </template>

    <footer class="footer">
      <p>总加载时间：{{ loadTime || '计算中...' }}</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loading: true,
      loadTime: '',
      metrics: { fcp: 0, lcp: 0, domReady: 0 },
      features: [
        { icon: '⚡', title: '极速体验', desc: '首屏加载 < 1s' },
        { icon: '🎨', title: '优雅设计', desc: '现代化 UI 风格' },
        { icon: '🔒', title: '安全可靠', desc: 'HTTPS + CSP' },
        { icon: '📱', title: '响应式', desc: '适配所有设备' },
      ],
      stats: [
        { label: '活跃用户', value: '12.8万' },
        { label: '日均访问', value: '8.9万' },
        { label: '满意度', value: '98%' },
      ],
    }
  },
  mounted() {
    this.measurePerformance()
    // 模拟异步加载非首屏内容
    setTimeout(() => {
      this.loading = false
    }, 300)
  },
  methods: {
    measurePerformance() {
      setTimeout(() => {
        var nav = performance.getEntriesByType('navigation')[0]
        if (nav) {
          this.metrics = {
            fcp: Math.round(nav.domContentLoadedEventStart - nav.startTime),
            lcp: Math.round(nav.loadEventEnd - nav.startTime),
            domReady: Math.round(nav.domComplete - nav.startTime),
          }
          self.loadTime = self.metrics.lcp + 'ms'
        }
      }, 100)
    },
  },
}
</script>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1f2937;
}
.header h2 {
  margin: 0 0 8px;
  font-size: 22px;
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
.hero {
  padding: 40px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  margin-top: 20px;
}
.hero h3 {
  margin: 0 0 12px;
  font-size: 24px;
}
.desc {
  margin: 0 0 24px;
  font-size: 15px;
  opacity: 0.9;
}
.cta {
  display: flex;
  gap: 12px;
}
.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary {
  background: #fff;
  color: #3b82f6;
}
.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}
.loading {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
}
.features {
  margin-bottom: 24px;
}
.features h3 {
  margin: 0 0 16px;
  color: #3b82f6;
  font-size: 18px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.card {
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}
.icon {
  font-size: 32px;
  margin-bottom: 8px;
}
.card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #1f2937;
}
.card p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}
.stats {
  margin-bottom: 24px;
}
.stats h3 {
  margin: 0 0 16px;
  color: #3b82f6;
  font-size: 18px;
}
.stat-grid {
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
  font-size: 24px;
  font-weight: 700;
  color: #15803d;
}
.label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
.footer-section {
  padding: 24px;
  background: #1f2937;
  color: #d1d5db;
  border-radius: 8px;
  text-align: center;
}
.links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}
.links a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 13px;
}
.copyright {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
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
