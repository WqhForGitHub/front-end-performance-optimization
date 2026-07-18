<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const count = ref(0)
const mountTime = ref<string>('')
const activeTime = ref<string>('')
const deactiveTime = ref<string>('')

onMounted(() => {
  mountTime.value = new Date().toLocaleTimeString()
  console.log('[CounterTab] onMounted - 仅执行一次')
})

onActivated(() => {
  activeTime.value = new Date().toLocaleTimeString()
  console.log('[CounterTab] onActivated - 被 KeepAlive 激活')
})

onDeactivated(() => {
  deactiveTime.value = new Date().toLocaleTimeString()
  console.log('[CounterTab] onDeactivated - 被 KeepAlive 缓存')
})
</script>

<template>
  <div class="panel">
    <h3>计数器面板</h3>
    <p class="desc">切换 tab 再回来，计数器的值会被保留。</p>
    <div class="counter">
      <button @click="count--">- 减少</button>
      <span class="value">{{ count }}</span>
      <button @click="count++">+ 增加</button>
    </div>
    <ul class="info">
      <li>首次挂载时间：{{ mountTime || '尚未挂载' }}</li>
      <li>最近激活时间：{{ activeTime || '尚未激活' }}</li>
      <li>最近缓存时间：{{ deactiveTime || '尚未缓存' }}</li>
    </ul>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}
.counter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}
.counter button {
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.counter button:hover {
  background: #2563eb;
}
.value {
  font-size: 28px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
  color: #3b82f6;
}
.info {
  list-style: none;
  padding: 0;
  color: #6b7280;
  font-size: 13px;
}
.info li {
  padding: 4px 0;
}
.desc {
  color: #6b7280;
  font-size: 14px;
}
</style>
