<template>
  <div class="app">
    <header class="header">
      <h2>Vue2 - 解决 vendor 文件过大</h2>
      <p class="subtitle">
        通过分包、CDN、异步组件、压缩等手段减小 vendor 体积
      </p>
    </header>

    <div class="grid">
      <div v-for="s in solutions" :key="s.title" class="card">
        <h3>{{ s.title }}</h3>
        <p class="desc">{{ s.desc }}</p>
        <div class="compare">
          <span class="bad">前: {{ s.before }}</span>
          <span class="arrow">-&gt;</span>
          <span class="good">后: {{ s.after }}</span>
        </div>
        <code class="code">{{ s.code }}</code>
      </div>
    </div>

    <section class="chart-section">
      <h3>异步组件懒加载演示</h3>
      <p class="hint">点击按钮懒加载重型组件，不进入 vendor</p>
      <button class="btn" @click="toggleChart">
        {{ showChart ? '隐藏' : '加载' }}图表组件
      </button>
      <div class="chart-area">
        <div v-if="showChart && chartLoaded" class="chart">
          <div class="bars">
            <div
              v-for="(v, i) in chartData"
              :key="i"
              class="bar"
              :style="{ height: v + '%' }"
            ></div>
          </div>
        </div>
        <div v-else class="placeholder">未加载</div>
      </div>
    </section>

    <footer class="footer">
      <p>提示：运行 npm run build 查看分包效果</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showChart: false,
      chartLoaded: false,
      chartData: [],
      solutions: [
        {
          title: '1. manualChunks 分包',
          desc: '把 Vue 等第三方库单独分包',
          before: 'vendor.js 800KB',
          after: 'vue.js 60KB + vendor.js 200KB',
          code: "manualChunks: { vue: ['vue'] }",
        },
        {
          title: '2. externals + CDN',
          desc: '大库走 CDN，不打包进 bundle',
          before: 'bundle 1.2MB',
          after: 'bundle 400KB',
          code: "externals: { vue: 'Vue' }",
        },
        {
          title: '3. 异步组件懒加载',
          desc: '非首屏组件通过 import() 异步加载',
          before: 'app.js 600KB',
          after: 'app.js 200KB + chart.js 400KB',
          code: "() => import('./Chart.vue')",
        },
        {
          title: '4. Gzip/Brotli 压缩',
          desc: '传输体积减小 60%-80%',
          before: '传输 800KB',
          after: '传输 200KB',
          code: "viteCompression({ algorithm: 'gzip' })",
        },
        {
          title: '5. Tree Shaking',
          desc: '使用 ESM 按需引入',
          before: 'lodash 70KB',
          after: 'lodash-es 按需 4KB',
          code: "import { debounce } from 'lodash-es'",
        },
        {
          title: '6. 按需引入第三方库',
          desc: '避免全量打包',
          before: 'element-ui 1MB',
          after: '按需 50KB',
          code: "import { Button } from 'element-ui'",
        },
      ],
    }
  },
  methods: {
    toggleChart() {
      this.showChart = !this.showChart
      if (this.showChart && !this.chartLoaded) {
        // 模拟异步加载
        setTimeout(() => {
          this.chartData = Array.from({ length: 12 }, () =>
            Math.floor(Math.random() * 100),
          )
          this.chartLoaded = true
        }, 200)
      }
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
  margin: 0 0 24px;
  font-size: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.card {
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.card h3 {
  margin: 0 0 8px;
  color: #3b82f6;
  font-size: 15px;
}
.desc {
  color: #4b5563;
  font-size: 13px;
  margin: 0 0 12px;
}
.compare {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
}
.bad {
  color: #ef4444;
}
.good {
  color: #10b981;
}
.arrow {
  color: #9ca3af;
}
.code {
  display: block;
  background: #1f2937;
  color: #a7f3d0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Fira Code', 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
.chart-section {
  padding: 20px;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin-bottom: 24px;
}
.chart-section h3 {
  margin: 0 0 8px;
  color: #15803d;
  font-size: 16px;
}
.hint {
  color: #166534;
  font-size: 13px;
  margin: 0 0 16px;
}
.btn {
  padding: 8px 20px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.chart-area {
  margin-top: 16px;
  min-height: 200px;
  background: #fff;
  border-radius: 6px;
  padding: 20px;
}
.chart {
  height: 160px;
}
.bars {
  display: flex;
  gap: 4px;
  height: 100%;
  align-items: flex-end;
}
.bar {
  flex: 1;
  min-width: 16px;
  background: linear-gradient(180deg, #3b82f6, #93c5fd);
  border-radius: 4px 4px 0 0;
}
.placeholder {
  text-align: center;
  color: #9ca3af;
  line-height: 160px;
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
