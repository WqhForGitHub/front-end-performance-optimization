<script setup lang="ts">
import { ref, onUpdated } from 'vue'
import MemoListItem from './components/MemoListItem.vue'

// ---- 全局渲染计数（用于对比）----
const appRenderCount = ref(0)
appRenderCount.value++
onUpdated(() => {
  appRenderCount.value++
})

// ---- v-once 演示：静态内容只在首次渲染 ----
const staticTitle = 'Vue 性能优化指南'
const staticVersion = 'v3.4'
const staticAuthor = 'Performance Team'

// ---- v-memo 演示：动态数据 ----
const tick = ref(0)
const message = ref('Hello World')
const useMemo = ref(true)

// ---- 列表 v-memo 演示 ----
interface ListItem {
  id: number
  label: string
  selected: boolean
}

const list = ref<ListItem[]>(
  Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    label: `项目 ${i + 1}`,
    selected: false,
  })),
)

function toggleMemo() {
  useMemo.value = !useMemo.value
}

function triggerUpdate() {
  tick.value++
  message.value = `Hello World @ ${tick.value}`
}

function toggleItem(id: number) {
  const item = list.value.find((i) => i.id === id)
  if (item) {
    item.selected = !item.selected
  }
}

function shuffleLabel() {
  // 仅改变第一个项目的 label，验证其他项目是否跳过重新渲染
  list.value[0].label = `项目 1 - 更新 ${Date.now() % 1000}`
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>v-once 与 v-memo 静态内容优化</h1>
      <p class="subtitle">
        全局重新渲染次数：
        <strong class="render-count">{{ appRenderCount }}</strong>
      </p>
    </header>

    <!-- v-once 演示区域 -->
    <section class="card">
      <h2>1. v-once - 永不重新渲染</h2>
      <p class="desc">
        使用 <code>v-once</code> 的元素只在首次渲染时求值，之后即使依赖数据变化也不会更新。
        适用于纯静态内容（标题、说明、版本号等）。
      </p>
      <div class="demo-row">
        <div class="block once">
          <h3>v-once 渲染（静态）</h3>
          <div v-once>
            <p>标题：{{ staticTitle }}</p>
            <p>版本：{{ staticVersion }}</p>
            <p>作者：{{ staticAuthor }}</p>
            <p class="frozen">tick = {{ tick }}（已冻结，不会随更新改变）</p>
          </div>
        </div>
        <div class="block normal">
          <h3>普通渲染（动态）</h3>
          <p>标题：{{ staticTitle }}</p>
          <p>版本：{{ staticVersion }}</p>
          <p>作者：{{ staticAuthor }}</p>
          <p class="live">tick = {{ tick }}（实时更新）</p>
        </div>
      </div>
    </section>

    <!-- v-memo 演示区域 -->
    <section class="card">
      <h2>2. v-memo - 条件化记忆</h2>
      <p class="desc">
        <code>v-memo="[依赖数组]"</code> 仅当依赖变化时才重新渲染该子树。
        可用于跳过大列表中未变更的项。
      </p>
      <div class="control">
        <label class="switch">
          <input v-model="useMemo" type="checkbox" @change="toggleMemo" />
          <span>v-memo：{{ useMemo ? '已启用' : '已禁用' }}</span>
        </label>
        <button class="btn" @click="triggerUpdate">触发全局更新 (tick = {{ tick }})</button>
      </div>
      <div class="memo-demo">
        <div v-if="useMemo" v-memo="[message]">
          <p class="memo-content">v-memo 区域 - {{ message }}</p>
          <p class="memo-note">此子树只在 message 变化时重新渲染（与 tick 无关）</p>
        </div>
        <div v-else>
          <p class="memo-content">普通区域 - {{ message }}</p>
          <p class="memo-note">此子树每次 tick 都会重新渲染</p>
        </div>
      </div>
    </section>

    <!-- 列表 v-memo 演示 -->
    <section class="card">
      <h2>3. 列表 v-memo - 跳过未变更项</h2>
      <p class="desc">
        点击「打乱首项标签」时，启用 v-memo 的列表只有第一项重新渲染，
        其余项保持渲染次数不变。每项右侧显示自身渲染次数。
      </p>
      <div class="control">
        <button class="btn primary" @click="toggleItem(1)">切换 #1 选中</button>
        <button class="btn" @click="toggleItem(2)">切换 #2 选中</button>
        <button class="btn" @click="shuffleLabel">打乱首项标签</button>
        <button class="btn warn" @click="triggerUpdate">触发外部更新</button>
      </div>

      <template v-if="useMemo">
        <h3 class="sub-title">使用 v-memo（依赖 id + selected + label）</h3>
        <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected, item.label]">
          <MemoListItem :id="item.id" :label="item.label" :selected="item.selected" />
        </div>
      </template>

      <template v-else>
        <h3 class="sub-title">未使用 v-memo（每次外部更新全部重渲染）</h3>
        <div v-for="item in list" :key="item.id">
          <MemoListItem :id="item.id" :label="item.label" :selected="item.selected" />
        </div>
      </template>
    </section>

    <footer class="footer">
      <p>提示：观察每项右侧「渲染次数」 - 启用 v-memo 后未变更项的渲染次数会显著减少。</p>
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
.render-count {
  color: #ef4444;
  font-size: 18px;
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
  color: #1f2937;
}
.desc {
  color: #6b7280;
  font-size: 13px;
  margin: 0 0 16px;
  line-height: 1.6;
}
code {
  background: #e0e7ff;
  color: #4338ca;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.demo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.block {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}
.block h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
}
.once {
  border-left: 3px solid #10b981;
}
.normal {
  border-left: 3px solid #f59e0b;
}
.frozen {
  color: #10b981;
  font-weight: 600;
}
.live {
  color: #f59e0b;
  font-weight: 600;
}
.control {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.switch {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
}
.switch input {
  width: 18px;
  height: 18px;
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
.btn.warn {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}
.memo-demo {
  background: #fff;
  border: 1px dashed #93c5fd;
  border-radius: 6px;
  padding: 16px;
}
.memo-content {
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 6px;
}
.memo-note {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
}
.sub-title {
  font-size: 14px;
  color: #6b7280;
  margin: 16px 0 8px;
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
