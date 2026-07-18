<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import CounterTab from './components/CounterTab.vue'
import FormTab from './components/FormTab.vue'
import TimerTab from './components/TimerTab.vue'
import ListTab from './components/ListTab.vue'

type TabKey = 'counter' | 'form' | 'timer' | 'list'

const activeTab = ref<TabKey>('counter')
const useKeepAlive = ref(true)
const remountCount = ref(0)

const tabs: Array<{ key: TabKey; label: string; component: any }> = [
  { key: 'counter', label: '计数器', component: CounterTab },
  { key: 'form', label: '表单', component: FormTab },
  { key: 'timer', label: '计时器', component: TimerTab },
  { key: 'list', label: '列表', component: ListTab },
]

const currentComponent = computed(() => {
  const tab = tabs.find((t) => t.key === activeTab.value)
  return tab ? tab.component : null
})

function switchTab(key: TabKey) {
  if (key === activeTab.value) return
  activeTab.value = key
  if (!useKeepAlive.value) {
    remountCount.value++
  }
}

function toggleKeepAlive() {
  useKeepAlive.value = !useKeepAlive.value
  remountCount.value = 0
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Vue KeepAlive 组件缓存优化</h1>
      <p class="subtitle">通过 KeepAlive 缓存不活动的组件实例，避免重复渲染与状态丢失</p>
    </header>

    <section class="control">
      <label class="switch">
        <input v-model="useKeepAlive" type="checkbox" @change="toggleKeepAlive" />
        <span>KeepAlive：{{ useKeepAlive ? '已开启' : '已关闭' }}</span>
      </label>
      <span class="hint">
        {{
          useKeepAlive
            ? '组件切换时被缓存，状态保留，不触发 onUnmounted'
            : '组件切换时被销毁，状态丢失，触发 onMounted 重新初始化'
        }}
      </span>
      <span class="remount">无缓存重新挂载次数：{{ remountCount }}</span>
    </section>

    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="content">
      <KeepAlive v-if="useKeepAlive">
        <component :is="currentComponent" :key="activeTab" />
      </KeepAlive>
      <component :is="currentComponent" v-else :key="activeTab" />
    </main>

    <footer class="footer">
      <p>提示：打开浏览器控制台查看 onActivated / onDeactivated / onMounted 生命周期日志</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 760px;
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
.control {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
}
.switch input {
  width: 18px;
  height: 18px;
}
.hint {
  color: #6b7280;
  font-size: 13px;
}
.remount {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
}
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}
.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}
.tab:hover {
  color: #2563eb;
}
.content {
  min-height: 320px;
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
