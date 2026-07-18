<template>
  <div class="app">
    <header class="header">
      <h2>Vue2 - 大量数据渲染优化</h2>
      <p class="subtitle">
        对比朴素渲染、虚拟滚动、分页加载三种方案的渲染性能
      </p>
    </header>

    <div class="control">
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
      <p class="desc">{{ currentDesc }}</p>
    </div>

    <main class="content">
      <!-- 朴素渲染 -->
      <div v-if="mode === 'naive'" class="list-container">
        <div class="info bad">
          <span>渲染数量：{{ naiveData.length }}</span>
          <span>渲染耗时：{{ naiveTime }}ms</span>
        </div>
        <div class="list">
          <div v-for="item in naiveData" :key="item.id" class="item">
            <span class="id">#{{ item.id }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 虚拟滚动 -->
      <div v-else-if="mode === 'virtual'" class="list-container">
        <div class="info good">
          <span>总数量：{{ virtualData.length.toLocaleString() }}</span>
          <span>实际渲染：{{ visibleItems.length }}</span>
          <span>渲染耗时：{{ virtualTime }}ms</span>
        </div>
        <div class="viewport" @scroll="handleScroll">
          <div class="phantom" :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div
              v-for="item in visibleItems"
              :key="item.id"
              class="item virtual-item"
              :style="{ top: item._top + 'px' }"
            >
              <span class="id">#{{ item.id }}</span>
              <span class="name">{{ item.name }}</span>
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-else class="list-container">
        <div class="info info-blue">
          <span>总数量：{{ paginatedData.length.toLocaleString() }}</span>
          <span>当前页：{{ currentPage }} / {{ totalPages }}</span>
        </div>
        <div class="list">
          <div v-for="item in pageData" :key="item.id" class="item">
            <span class="id">#{{ item.id }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </div>
        <div class="pager">
          <button :disabled="currentPage === 1" @click="currentPage = 1">首页</button>
          <button :disabled="currentPage === 1" @click="currentPage--">上一页</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
          <button :disabled="currentPage === totalPages" @click="currentPage = totalPages">末页</button>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>提示：朴素渲染建议数据量 &lt;= 5000</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      mode: 'virtual',
      dataSize: 10000,
      modes: [
        { key: 'naive', label: '朴素渲染', desc: '一次性渲染全部 DOM，10k 条会卡顿' },
        { key: 'virtual', label: '虚拟滚动', desc: '只渲染可视区域，10w 条流畅' },
        { key: 'pagination', label: '分页加载', desc: '每页 50 条，按需加载' },
      ],
      // 朴素渲染
      naiveData: [],
      naiveTime: 0,
      // 虚拟滚动
      virtualData: [],
      virtualTime: 0,
      scrollTop: 0,
      ITEM_HEIGHT: 40,
      VIEWPORT_HEIGHT: 500,
      BUFFER: 5,
      // 分页
      paginatedData: [],
      currentPage: 1,
      PAGE_SIZE: 50,
    }
  },
  computed: {
    currentDesc() {
      var m = this.modes.find((t) => t.key === this.mode)
      return m ? m.desc : ''
    },
    visibleItems() {
      var start = Math.max(0, Math.floor(this.scrollTop / this.ITEM_HEIGHT) - this.BUFFER)
      var end = Math.min(
        this.virtualData.length,
        start + Math.ceil(this.VIEWPORT_HEIGHT / this.ITEM_HEIGHT) + this.BUFFER * 2,
      )
      return this.virtualData.slice(start, end).map((item, i) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        _top: (start + i) * this.ITEM_HEIGHT,
      }))
    },
    totalHeight() {
      return this.virtualData.length * this.ITEM_HEIGHT
    },
    totalPages() {
      return Math.ceil(this.paginatedData.length / this.PAGE_SIZE)
    },
    pageData() {
      var start = (this.currentPage - 1) * this.PAGE_SIZE
      return this.paginatedData.slice(start, start + this.PAGE_SIZE)
    },
  },
  watch: {
    mode() {
      this.generateData()
    },
    dataSize() {
      this.generateData()
    },
  },
  mounted() {
    this.generateData()
  },
  methods: {
    switchMode(key) {
      this.mode = key
    },
    generateData() {
      var size = this.dataSize
      if (this.mode === 'naive') {
        size = Math.min(size, 5000)
        var start1 = performance.now()
        this.naiveData = Array.from({ length: size }, (_, i) => ({
          id: i + 1,
          name: 'Item ' + (i + 1),
          value: Math.floor(Math.random() * 1000),
        }))
        this.naiveTime = Math.round(performance.now() - start1)
      } else if (this.mode === 'virtual') {
        var start2 = performance.now()
        this.virtualData = Array.from({ length: size }, (_, i) => ({
          id: i + 1,
          name: 'Item ' + (i + 1),
          value: Math.floor(Math.random() * 1000),
        }))
        this.virtualTime = Math.round(performance.now() - start2)
      } else {
        this.paginatedData = Array.from({ length: size }, (_, i) => ({
          id: i + 1,
          name: 'Item ' + (i + 1),
          value: Math.floor(Math.random() * 1000),
        }))
        this.currentPage = 1
      }
    },
    handleScroll(e) {
      var target = e.target
      if (this._raf) cancelAnimationFrame(this._raf)
      this._raf = requestAnimationFrame(() => {
        this.scrollTop = target.scrollTop
      })
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
.list-container {
  font-family: system-ui, sans-serif;
}
.info {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}
.info.bad {
  background: #fee2e2;
  color: #991b1b;
}
.info.good {
  background: #dcfce7;
  color: #166534;
}
.info-blue {
  background: #dbeafe;
  color: #1e40af;
}
.list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.item {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.virtual-item {
  position: absolute;
  height: 40px;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
}
.id {
  color: #9ca3af;
  min-width: 60px;
}
.name {
  flex: 1;
  color: #1f2937;
}
.value {
  color: #3b82f6;
  font-weight: 600;
}
.viewport {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.phantom {
  width: 100%;
}
.pager {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
}
.pager button {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.pager button:disabled {
  background: #f9fafb;
  color: #d1d5db;
  cursor: not-allowed;
}
.page-info {
  font-size: 13px;
  color: #6b7280;
  min-width: 80px;
  text-align: center;
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
