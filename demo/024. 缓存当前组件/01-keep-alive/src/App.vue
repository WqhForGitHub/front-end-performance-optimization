<script setup lang="ts">
import { ref, shallowRef, markRaw } from 'vue'
import HomeView from './components/HomeView.vue'
import SettingsView from './components/SettingsView.vue'
import ProfileView from './components/ProfileView.vue'
import ListView from './components/ListView.vue'

interface Tab {
  name: string
  label: string
  component: any
}

const tabs: Tab[] = [
  { name: 'home', label: '首页', component: markRaw(HomeView) },
  { name: 'settings', label: '设置', component: markRaw(SettingsView) },
  { name: 'profile', label: '个人资料', component: markRaw(ProfileView) },
  { name: 'list', label: '列表', component: markRaw(ListView) },
]

const activeTab = ref<string>('home')
const currentComponent = shallowRef<any>(tabs[0].component)

// 全局生命周期事件日志
interface LogEntry {
  time: string
  tab: string
  event: string
}
const logs = ref<LogEntry[]>([])

function pushLog(tab: string, event: string) {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0')
  logs.value.unshift({ time, tab, event })
  if (logs.value.length > 20) logs.value.pop()
}

// 子组件通过自定义事件上报生命周期
function handleLifecycle(payload: { tab: string; event: string }) {
  pushLog(payload.tab, payload.event)
}

function switchTab(name: string) {
  const tab = tabs.find((t) => t.name === name)
  if (!tab) return
  activeTab.value = name
  currentComponent.value = tab.component
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue3 KeepAlive 基础缓存</h1>
      <p class="subtitle">
        切换 Tab 时观察：组件状态被保留，仅触发 <code>onActivated</code> / <code>onDeactivated</code>，不再触发 <code>onMounted</code> / <code>onUnmounted</code>
      </p>
    </header>

    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="['tab', { active: activeTab === tab.name }]"
        @click="switchTab(tab.name)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="content">
      <KeepAlive>
        <component :is="currentComponent" @lifecycle="handleLifecycle" :tab-name="activeTab" />
      </KeepAlive>
    </main>

    <aside class="log-panel">
      <h2>生命周期事件日志</h2>
      <p class="hint">最近 20 条事件（最新在前）</p>
      <ul>
        <li v-for="(log, idx) in logs" :key="idx" :class="log.event">
          <span class="time">{{ log.time }}</span>
          <span class="tag">[{{ log.tab }}]</span>
          <span class="event">{{ log.event }}</span>
        </li>
        <li v-if="logs.length === 0" class="empty">暂无事件，切换 Tab 试试</li>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 360px;
  grid-template-rows: auto auto 1fr;
  gap: 16px;
  min-height: 100vh;
}

.app-header {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #42b983, #35495e);
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

.tabs {
  grid-column: 1 / -1;
  display: flex;
  gap: 6px;
  background: #fff;
  padding: 8px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #606266;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.tab:hover {
  background: #f0f2f5;
}

.tab.active {
  background: #42b983;
  color: #fff;
}

.content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.log-panel {
  background: #2c3e50;
  color: #ecf0f1;
  border-radius: 12px;
  padding: 18px;
  overflow: auto;
  max-height: 70vh;
}

.log-panel h2 {
  font-size: 15px;
  margin-bottom: 4px;
  color: #42b983;
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
  align-items: center;
}

.log-panel li .time {
  color: #95a5a6;
  width: 110px;
}

.log-panel li .tag {
  color: #f1c40f;
  width: 70px;
}

.log-panel li.onActivated .event,
.log-panel li.onMounted .event {
  color: #2ecc71;
}

.log-panel li.onDeactivated .event,
.log-panel li.onUnmounted .event {
  color: #e74c3c;
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
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #e74c3c;
}
</style>
