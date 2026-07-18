<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const text = ref('')
const notes = ref<string[]>([])
const mountTime = ref<string>('')

onMounted(() => {
  mountTime.value = new Date().toLocaleTimeString()
  console.log('[FormTab] onMounted - 表单初始化（仅一次）')
})

onActivated(() => {
  console.log('[FormTab] onActivated - 表单恢复焦点状态')
})

onDeactivated(() => {
  console.log('[FormTab] onDeactivated - 表单状态被缓存')
})

function addNote() {
  if (text.value.trim()) {
    notes.value.push(text.value.trim())
    text.value = ''
  }
}
</script>

<template>
  <div class="panel">
    <h3>表单面板</h3>
    <p class="desc">在输入框输入文字后切换 tab，文字会被保留。</p>
    <div class="form">
      <input v-model="text" placeholder="输入一些内容..." @keyup.enter="addNote" />
      <button @click="addNote">添加</button>
    </div>
    <p class="hint">当前输入：{{ text || '(空)' }}</p>
    <ul class="notes">
      <li v-for="(note, i) in notes" :key="i">{{ note }}</li>
    </ul>
    <p class="mount-info">挂载时间：{{ mountTime }}</p>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}
.form {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}
.form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.form button {
  padding: 8px 16px;
  border: none;
  background: #10b981;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.notes {
  list-style: none;
  padding: 0;
}
.notes li {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 4px;
}
.hint {
  color: #6b7280;
  font-size: 13px;
}
.mount-info {
  color: #9ca3af;
  font-size: 12px;
  margin-top: 16px;
}
.desc {
  color: #6b7280;
  font-size: 14px;
}
</style>
