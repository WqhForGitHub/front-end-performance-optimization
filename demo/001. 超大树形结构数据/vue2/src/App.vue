<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 900px; margin: 0 auto">
    <h2>Vue2 - 超大树形数据处理</h2>

    <!-- 数据生成控制面板 -->
    <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; margin-bottom: 16px">
      <h3 style="margin-top: 0">模拟后端一次性返回的超大树形数据</h3>
      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
        <label>
          树深度:
          <input
            v-model.number="depth"
            type="number"
            min="1"
            max="8"
            style="width: 60px; margin-left: 8px"
          />
        </label>
        <label>
          每层子节点数:
          <input
            v-model.number="breadth"
            type="number"
            min="1"
            max="20"
            style="width: 60px; margin-left: 8px"
          />
        </label>
        <button
          :style="{
            padding: '6px 16px',
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }"
          @click="handleGenerate"
        >
          {{ loading ? '生成中...' : '生成数据' }}
        </button>
        <span v-if="data.length > 0" style="color: #e65100">
          总节点数: <strong>{{ totalNodes }}</strong>
        </span>
      </div>
      <p style="color: #999; font-size: 13px; margin-bottom: 0">
        提示: 深度5×广度8 ≈ 37448 节点 | 深度5×广度10 ≈ 111110 节点
      </p>
    </div>

    <!-- 方法切换 Tab -->
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :style="{
          padding: '8px 16px',
          background: method === tab.key ? '#1976d2' : '#fff',
          color: method === tab.key ? '#fff' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
        }"
        @click="method = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 当前方法说明 -->
    <div style="margin-bottom: 16px; color: #666; font-size: 14px">
      {{ currentDesc }}
    </div>

    <!-- 树渲染区域 -->
    <normal-tree v-if="data.length > 0 && method === 'normal'" :data="data" />
    <virtual-tree
      v-else-if="data.length > 0 && method === 'virtual'"
      :data="data"
      :default-expand-depth="0"
    />
    <time-slice-tree
      v-else-if="data.length > 0 && method === 'timeSlice'"
      :data="data"
      :default-expand-depth="0"
    />
    <div
      v-else
      :style="{
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #ddd',
        borderRadius: '4px',
        color: '#999',
      }"
    >
      请先生成数据
    </div>
  </div>
</template>

<script>
import { generateBigTree, countNodes } from './utils/treeData'
import NormalTree from './components/NormalTree.vue'
import VirtualTree from './components/VirtualTree.vue'
import TimeSliceTree from './components/TimeSliceTree.vue'

export default {
  name: 'App',
  components: { NormalTree, VirtualTree, TimeSliceTree },
  data() {
    return {
      depth: 5,
      breadth: 8,
      data: [],
      method: 'virtual',
      loading: false,
      tabs: [
        { key: 'normal', label: '方法一: 直接渲染', desc: '递归全量渲染，性能最差（对比用）' },
        { key: 'virtual', label: '方法二: 虚拟列表', desc: '只渲染可视区域，DOM 数恒定（推荐）' },
        { key: 'timeSlice', label: '方法三: 时间分片', desc: '分批渲染节点，避免主线程长时间阻塞' },
      ],
    }
  },
  computed: {
    totalNodes() {
      return countNodes(this.data)
    },
    currentDesc() {
      const tab = this.tabs.find((t) => t.key === this.method)
      return tab ? tab.desc : ''
    },
  },
  methods: {
    handleGenerate() {
      this.loading = true
      // 用 setTimeout 让 UI 先更新 loading 态
      setTimeout(() => {
        this.data = generateBigTree(this.depth, this.breadth)
        this.loading = false
      }, 50)
    },
  },
}
</script>
