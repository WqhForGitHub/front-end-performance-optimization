<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  age: number
  active: boolean
}

const props = defineProps<{
  users: User[]
}>()

const renderCount = ref(0)

function logRender() {
  renderCount.value++
   
  console.log('[GoodPractice] 渲染次数:', renderCount.value)
}

// 优化方式 1：在外层使用 v-if 控制整体显隐
// 优化方式 2：使用 computed 在父组件提前过滤（本示例父组件已处理）
// 优化方式 3：使用 template 标签包裹 v-for，内部元素再使用 v-if
</script>

<template>
  <div class="card">
    <h2>正确写法：v-if 与 v-for 分离</h2>
    <p class="ok">
      方案一：外层用 v-if 控制整体显隐，内层用 v-for 渲染列表
    </p>

    <!-- 优化方案 1：外层 v-if 控制整体显隐 -->
    <div v-if="props.users.length > 0">
      <ul class="user-list">
        <li
          v-for="user in props.users"
          :key="user.id"
          class="user-item"
          @click="logRender"
        >
          <span class="name">{{ user.name }}</span>
          <span class="age">{{ user.age }} 岁</span>
          <span :class="['tag', { active: user.active, inactive: !user.active }]">
            {{ user.active ? '激活' : '未激活' }}
          </span>
        </li>
      </ul>
    </div>
    <p v-else class="empty">暂无用户</p>

    <!-- 优化方案 2：使用 template 包裹 v-for，内部再使用 v-if -->
    <div class="section">
      <h3>方案二：template 包裹 v-for + 内部 v-if</h3>
      <ul class="user-list">
        <template v-for="user in props.users" :key="user.id">
          <li v-if="user.active" class="user-item" @click="logRender">
            <span class="name">{{ user.name }}</span>
            <span class="age">{{ user.age }} 岁</span>
            <span class="tag active">激活</span>
          </li>
        </template>
      </ul>
    </div>

    <p class="hint">点击任意条目查看渲染次数</p>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  border-radius: 8px;
  padding: 20px;
}
.card h2 {
  margin: 0 0 8px;
  color: #15803d;
  font-size: 18px;
}
.ok {
  color: #166534;
  font-size: 13px;
  margin: 0 0 16px;
}
.section {
  margin-top: 20px;
}
.section h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #15803d;
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
  background: #dcfce7;
}
.name {
  font-weight: 600;
  flex: 1;
}
.age {
  color: #6b7280;
}
.tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.tag.active {
  background: #dcfce7;
  color: #15803d;
}
.tag.inactive {
  background: #f3f4f6;
  color: #6b7280;
}
.empty {
  color: #9ca3af;
  text-align: center;
  padding: 20px;
}
.hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 12px;
}
</style>
