<template>
  <div class="app">
    <header class="header">
      <h2>Vue2 - v-if 与 v-for 的优先级</h2>
      <p class="subtitle">
        Vue2 中 v-for 优先级高于 v-if，意味着每次循环都会执行 v-if 判断，造成性能浪费
      </p>
    </header>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="control">
      <label class="switch">
        <input v-model="showAll" type="checkbox" />
        <span>{{ showAll ? '显示全部用户' : '仅显示成年且激活的用户' }}</span>
      </label>
    </div>

    <main class="content">
      <!-- 反例区域 -->
      <div v-if="activeTab === 'bad'" class="card bad">
        <h3>反例：v-for 与 v-if 同时使用</h3>
        <p class="warn">
          Vue2 中 v-for 优先级高于 v-if，会先循环所有用户再判断，性能浪费
        </p>
        <ul class="user-list">
          <!-- 这里 v-for 先执行，每次循环都会判断 v-if -->
          <!-- eslint-disable vue/no-use-v-if-with-v-for -->
          <li
            v-for="user in users"
            v-if="showAll ? true : user.active && user.age >= 18"
            :key="user.id"
            class="user-item"
            @click="badRenderCount++"
          >
            {{ user.name }} - {{ user.age }} 岁
            <span :class="['tag', user.active ? 'active' : 'inactive']">
              {{ user.active ? '激活' : '未激活' }}
            </span>
          </li>
        </ul>
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <p class="hint">渲染次数：{{ badRenderCount }}</p>
      </div>

      <!-- 正例区域 -->
      <div v-else class="card good">
        <h3>正确写法：computed 预先过滤</h3>
        <p class="ok">通过 computed 提前过滤数据，避免在模板中混用 v-if 与 v-for</p>
        <ul class="user-list">
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-item"
            @click="goodRenderCount++"
          >
            {{ user.name }} - {{ user.age }} 岁
            <span :class="['tag', user.active ? 'active' : 'inactive']">
              {{ user.active ? '激活' : '未激活' }}
            </span>
          </li>
        </ul>
        <p class="hint">渲染次数：{{ goodRenderCount }}</p>
      </div>
    </main>

    <footer class="footer">
      <p>提示：Vue2 中即使 v-if 为 false，v-for 也会遍历整个列表</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeTab: 'good',
      showAll: true,
      badRenderCount: 0,
      goodRenderCount: 0,
      users: [
        { id: 1, name: 'Alice', age: 28, active: true },
        { id: 2, name: 'Bob', age: 17, active: false },
        { id: 3, name: 'Charlie', age: 35, active: true },
        { id: 4, name: 'David', age: 15, active: true },
        { id: 5, name: 'Eve', age: 22, active: false },
        { id: 6, name: 'Frank', age: 40, active: true },
      ],
      tabs: [
        { key: 'bad', label: '反例：同时使用' },
        { key: 'good', label: '正例：computed 过滤' },
      ],
    }
  },
  computed: {
    filteredUsers() {
      if (this.showAll) return this.users
      return this.users.filter((u) => u.active && u.age >= 18)
    },
  },
  methods: {
    switchTab(key) {
      this.activeTab = key
    },
  },
}
</script>

<style scoped>
.app {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px;
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
  font-size: 14px;
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
  font-size: 14px;
}
.content {
  min-height: 320px;
}
.card {
  border-radius: 8px;
  padding: 20px;
}
.card.bad {
  border: 1px solid #fecaca;
  background: #fef2f2;
}
.card.good {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}
.card h3 {
  margin: 0 0 8px;
  font-size: 16px;
}
.card.bad h3 {
  color: #b91c1c;
}
.card.good h3 {
  color: #15803d;
}
.warn,
.ok {
  font-size: 13px;
  margin: 0 0 16px;
}
.warn {
  color: #991b1b;
}
.ok {
  color: #166534;
}
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.user-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  font-size: 14px;
}
.user-item:hover {
  background: #f9fafb;
}
.tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: auto;
}
.tag.active {
  background: #dcfce7;
  color: #15803d;
}
.tag.inactive {
  background: #f3f4f6;
  color: #6b7280;
}
.hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 12px;
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
