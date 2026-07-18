<script setup lang="ts">
import { ref, watch } from 'vue'

interface User {
  id: number
  name: string
  age: number
  active: boolean
}

defineProps<{
  users: User[]
}>()

const renderCount = ref(0)

watch(
  () => renderCount.value,
  () => {},
)

// 每次更新时记录一次渲染
function logRender() {
  renderCount.value++
   
  console.warn('[BadPractice] 渲染次数:', renderCount.value)
}
</script>

<template>
  <div class="card">
    <h2>反例：v-if 与 v-for 同时使用在同一元素</h2>
    <p class="warn">
      Vue3 中 v-if 优先级高于 v-for，v-if 无法访问 item 变量，会报错或行为不符合预期。
    </p>

    <!-- 错误示范：v-if 与 v-for 同级 -->
    <!-- Vue3 中此写法 v-if 先于 v-for 执行，访问 users 会异常 -->
    <!-- eslint-disable vue/no-use-v-if-with-v-for -->
    <ul class="user-list">
      <li
        v-for="user in users"
        v-if="user.active"
        :key="user.id"
        class="user-item"
        @click="logRender"
      >
        {{ user.name }} - {{ user.age }} 岁
      </li>
    </ul>
    <!-- eslint-enable vue/no-use-v-if-with-v-for -->

    <p class="hint">点击任意条目查看渲染次数</p>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #fecaca;
  background: #fef2f2;
  border-radius: 8px;
  padding: 20px;
}
.card h2 {
  margin: 0 0 8px;
  color: #b91c1c;
  font-size: 18px;
}
.warn {
  color: #991b1b;
  font-size: 13px;
  margin: 0 0 16px;
}
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.user-item {
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  font-size: 14px;
}
.user-item:hover {
  background: #fee2e2;
}
.hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 12px;
}
</style>
