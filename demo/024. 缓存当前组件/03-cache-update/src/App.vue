<script setup lang="ts">
import { ref, shallowRef, markRaw } from 'vue'
import NewsFeedView from './components/NewsFeedView.vue'
import OtherView from './components/OtherView.vue'
import type { Category } from './mockServer'

type Tab = 'news' | 'other'

const activeTab = ref<Tab>('news')
const currentComponent = shallowRef<any>(markRaw(NewsFeedView))

// 策略开关
const useActivatedRefresh = ref(true)
const useWatchProp = ref(true)

// 分类选择（用于 watch prop 策略）
const category = ref<Category>('all')

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'tech', label: '科技' },
  { value: 'sport', label: '体育' },
  { value: 'finance', label: '财经' },
]

// 策略 3：通过改变 :key 强制销毁重建组件
const refreshKey = ref(0)
function forceRecreate() {
  refreshKey.value++
  pushLog('system', `策略 3：key 变为 ${refreshKey.value}，NewsFeedView 即将销毁并重建`)
}

// 事件日志
interface LogEntry {
  time: string
  source: string
  message: string
  type: 'refresh' | 'lifecycle' | 'system'
}
const logs = ref<LogEntry[]>([])

function pushLog(source: string, message: string, type: LogEntry['type'] = 'system') {
  const d = new Date()
  const time =
    d.toLocaleTimeString('zh-CN', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  logs.value.unshift({ time, source, message, type })
  if (logs.value.length > 30) logs.value.pop()
}

function handleRefresh(payload: { trigger: string; time: string }) {
  pushLog('NewsFeedView', `数据刷新 @ ${payload.time}（触发：${payload.trigger}）`, 'refresh')
}

function handleLifecycle(payload: { event: string; time: string }) {
  pushLog('NewsFeedView', `${payload.event} @ ${payload.time}`, 'lifecycle')
}

function switchTab(tab: Tab) {
  activeTab.value = tab
  currentComponent.value = tab === 'news' ? markRaw(NewsFeedView) : markRaw(OtherView)
  pushLog('App', `切换到 Tab：${tab === 'news' ? '新闻列表' : '其他页面'}`)
}

function changeCategory(cat: Category) {
  const old = category.value
  category.value = cat
  pushLog('App', `分类变化：${old} -> ${cat}（watch 策略${useWatchProp.value ? '已开启，将触发刷新' : '已关闭，不触发刷新'}）`)
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>缓存组件的更新策略</h1>
      <p class="subtitle">
        KeepAlive 缓存的组件再次激活时不会重新执行 onMounted。本 Demo 展示 4 种让缓存组件更新数据的方式：
        <code>onActivated</code>、<code>watch</code>、<code>:key</code> 强制重建、手动刷新。
      </p>
    </header>

    <!-- 控制面板 -->
    <section class="control-panel">
      <h2>策略控制台</h2>

      <div class="control-grid">
        <div class="control-item">
          <div class="ctrl-head">
            <span class="num">1</span>
            <span class="title">onActivated 自动刷新</span>
          </div>
          <p class="ctrl-desc">组件从缓存恢复时自动拉取最新数据</p>
          <label class="switch-row">
            <input type="checkbox" v-model="useActivatedRefresh" />
            <span>{{ useActivatedRefresh ? '已开启' : '已关闭' }}</span>
          </label>
        </div>

        <div class="control-item">
          <div class="ctrl-head">
            <span class="num">2</span>
            <span class="title">watch 监听 prop 变化</span>
          </div>
          <p class="ctrl-desc">父组件 prop 变化时触发刷新</p>
          <label class="switch-row">
            <input type="checkbox" v-model="useWatchProp" />
            <span>{{ useWatchProp ? '已开启' : '已关闭' }}</span>
          </label>
        </div>

        <div class="control-item">
          <div class="ctrl-head">
            <span class="num">3</span>
            <span class="title">:key 强制重建</span>
          </div>
          <p class="ctrl-desc">改变 key 让组件销毁重建（绕过缓存）</p>
          <button class="ctrl-btn danger" @click="forceRecreate">
            强制重建（key={{ refreshKey }}）
          </button>
        </div>

        <div class="control-item">
          <div class="ctrl-head">
            <span class="num">4</span>
            <span class="title">手动刷新按钮</span>
          </div>
          <p class="ctrl-desc">组件内部提供刷新按钮</p>
          <span class="ctrl-tip">请查看右下方新闻列表中的"手动刷新"按钮</span>
        </div>
      </div>

      <!-- 分类选择器（配合策略 2） -->
      <div class="category-bar">
        <span class="cat-label">分类选择（驱动策略 2 的 prop）：</span>
        <button
          v-for="cat in categories"
          :key="cat.value"
          :class="['cat-btn', { active: category === cat.value }]"
          @click="changeCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </section>

    <!-- Tab 与组件展示 -->
    <section class="preview-panel">
      <nav class="tabs">
        <button :class="['tab', { active: activeTab === 'news' }]" @click="switchTab('news')">
          新闻列表（被缓存）
        </button>
        <button :class="['tab', { active: activeTab === 'other' }]" @click="switchTab('other')">
          其他页面
        </button>
      </nav>

      <main class="content">
        <KeepAlive>
          <component
            :is="currentComponent"
            :key="activeTab === 'news' ? `news-${refreshKey}` : 'other'"
            :category="category"
            :use-activated-refresh="useActivatedRefresh"
            :use-watch-prop="useWatchProp"
            @refresh="handleRefresh"
            @lifecycle="handleLifecycle"
          />
        </KeepAlive>
      </main>
    </section>

    <!-- 事件日志 -->
    <aside class="log-panel">
      <h2>事件日志</h2>
      <p class="hint">展示数据刷新与生命周期事件（最近 30 条）</p>
      <ul>
        <li v-for="(log, idx) in logs" :key="idx" :class="log.type">
          <span class="time">{{ log.time }}</span>
          <span class="source">[{{ log.source }}]</span>
          <span class="msg">{{ log.message }}</span>
        </li>
        <li v-if="logs.length === 0" class="empty">暂无事件</li>
      </ul>
    </aside>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  color: #2c3e50;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 380px;
  grid-template-rows: auto auto 1fr;
  gap: 16px;
  min-height: 100vh;
}

.app-header {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #e74c3c, #2c3e50);
  color: #fff;
  padding: 20px 28px;
  border-radius: 12px;
}

.app-header h1 {
  font-size: 22px;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 13px;
  opacity: 0.92;
  line-height: 1.6;
}

.subtitle code {
  background: rgba(0, 0, 0, 0.25);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.control-panel,
.preview-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.control-panel {
  grid-column: 1 / -1;
}

.control-panel h2,
.preview-panel h2,
.log-panel h2 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.control-item {
  background: #f8f9fb;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ctrl-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-head .num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e74c3c;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.ctrl-head .title {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.ctrl-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  flex: 1;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.switch-row input {
  cursor: pointer;
}

.ctrl-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #fff;
  background: #e74c3c;
}

.ctrl-btn:hover {
  background: #d23b2c;
}

.ctrl-btn.danger {
  background: #e74c3c;
}

.ctrl-tip {
  font-size: 11px;
  color: #909399;
  font-style: italic;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 14px;
  background: #f5f7fa;
  border-radius: 8px;
}

.cat-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-right: 6px;
}

.cat-btn {
  padding: 5px 14px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  border-radius: 14px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.cat-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.cat-btn.active {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}

.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.tab {
  padding: 8px 18px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s;
}

.tab:hover {
  background: #f0f2f5;
}

.tab.active {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}

.content {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}

.log-panel {
  background: #2c3e50;
  color: #ecf0f1;
  border-radius: 12px;
  padding: 18px;
  overflow: auto;
  max-height: 80vh;
}

.log-panel h2 {
  color: #e74c3c;
  font-size: 15px;
  margin-bottom: 4px;
}

.log-panel .hint {
  font-size: 11px;
  color: #95a5a6;
  margin-bottom: 12px;
}

.log-panel ul {
  list-style: none;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.log-panel li {
  padding: 6px 8px;
  border-bottom: 1px solid #34495e;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  line-height: 1.5;
}

.log-panel li .time {
  color: #95a5a6;
  flex-shrink: 0;
  width: 110px;
}

.log-panel li .source {
  color: #f1c40f;
  flex-shrink: 0;
  width: 110px;
}

.log-panel li .msg {
  flex: 1;
  word-break: break-all;
}

.log-panel li.refresh .msg {
  color: #2ecc71;
}

.log-panel li.lifecycle .msg {
  color: #3498db;
}

.log-panel li.system .msg {
  color: #ecf0f1;
}

.log-panel li.empty {
  color: #7f8c8d;
  justify-content: center;
  border: none;
  padding: 20px;
}

code {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  color: #e74c3c;
}
</style>
