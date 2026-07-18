<script setup lang="ts">
import { ref, computed } from 'vue'
import BadPractice from './components/BadPractice.vue'
import GoodPractice from './components/GoodPractice.vue'

interface User {
  id: number
  name: string
  age: number
  active: boolean
}

const users = ref<User[]>([
  { id: 1, name: 'Alice', age: 28, active: true },
  { id: 2, name: 'Bob', age: 17, active: false },
  { id: 3, name: 'Charlie', age: 35, active: true },
  { id: 4, name: 'David', age: 15, active: true },
  { id: 5, name: 'Eve', age: 22, active: false },
  { id: 6, name: 'Frank', age: 40, active: true },
])

const activeTab = ref<'bad' | 'good'>('good')
const showAll = ref(true)

// 优化方式：通过 computed 提前过滤，避免在模板中混用 v-if 与 v-for
const activeAdults = computed(() => {
  return users.value.filter((u) => u.active && u.age >= 18)
})

const visibleUsers = computed(() => {
  return showAll.value ? users.value : activeAdults.value
})

function toggleTab(tab: 'bad' | 'good') {
  activeTab.value = tab
}

function toggleShowAll() {
  showAll.value = !showAll.value
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Vue3 v-if 与 v-for 的优先级</h1>
      <p class="subtitle">
        Vue3 中 v-if 优先级高于 v-for，同时使用会导致 v-if 无法访问 v-for 中的变量
      </p>
    </header>

    <nav class="tabs">
      <button
        :class="['tab', { active: activeTab === 'bad' }]"
        @click="toggleTab('bad')"
      >
        反面示例（同时使用）
      </button>
      <button
        :class="['tab', { active: activeTab === 'good' }]"
        @click="toggleTab('good')"
      >
        正确写法（computed 过滤）
      </button>
    </nav>

    <section class="control">
      <label class="switch">
        <input v-model="showAll" type="checkbox" @change="toggleShowAll" />
        <span>{{ showAll ? '显示全部用户' : '仅显示成年且激活的用户' }}</span>
      </label>
    </section>

    <main class="content">
      <BadPractice v-if="activeTab === 'bad'" :users="visibleUsers" />
      <GoodPractice v-else :users="visibleUsers" />
    </main>

    <footer class="footer">
      <p>提示：打开浏览器控制台查看渲染过程与日志</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, -apple-system, sans-serif;
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
.control {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
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
