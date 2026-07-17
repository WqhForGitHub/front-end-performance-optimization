<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const props = defineProps<{ tabName: string }>()
const emit = defineEmits<{ (e: 'lifecycle', payload: { tab: string; event: string }): void }>()

interface ListItem {
  id: number
  text: string
  done: boolean
}

let nextId = 1
const items = ref<ListItem[]>([
  { id: nextId++, text: '学习 Vue3 KeepAlive', done: true },
  { id: nextId++, text: '理解 onActivated 与 onDeactivated', done: false },
])
const inputText = ref('')

onMounted(() => emit('lifecycle', { tab: props.tabName, event: 'onMounted' }))
onUnmounted(() => emit('lifecycle', { tab: props.tabName, event: 'onUnmounted' }))
onActivated(() => emit('lifecycle', { tab: props.tabName, event: 'onActivated' }))
onDeactivated(() => emit('lifecycle', { tab: props.tabName, event: 'onDeactivated' }))

function addItem() {
  const text = inputText.value.trim()
  if (!text) return
  items.value.push({ id: nextId++, text, done: false })
  inputText.value = ''
}

function toggle(item: ListItem) {
  item.done = !item.done
}

function remove(id: number) {
  const idx = items.value.findIndex((i) => i.id === id)
  if (idx >= 0) items.value.splice(idx, 1)
}

function clearDone() {
  items.value = items.value.filter((i) => !i.done)
}
</script>

<template>
  <div class="list-view">
    <h2>待办列表</h2>
    <p class="desc">
      添加 / 删除 / 切换状态后切到其他 Tab，再切回来，列表内容会被完整保留。
      这是 KeepAlive 缓存组件内部复杂数据结构的典型场景。
    </p>

    <div class="add-bar">
      <input
        v-model="inputText"
        type="text"
        placeholder="输入待办事项后回车添加"
        @keyup.enter="addItem"
      />
      <button class="add-btn" @click="addItem">添加</button>
    </div>

    <ul class="list">
      <li v-for="item in items" :key="item.id" :class="{ done: item.done }">
        <input type="checkbox" :checked="item.done" @change="toggle(item)" />
        <span class="item-text">{{ item.text }}</span>
        <button class="del-btn" @click="remove(item.id)">删除</button>
      </li>
      <li v-if="items.length === 0" class="empty">列表为空</li>
    </ul>

    <div class="footer" v-if="items.length > 0">
      <span>共 {{ items.length }} 项，已完成 {{ items.filter((i) => i.done).length }} 项</span>
      <button class="clear-btn" @click="clearDone">清除已完成</button>
    </div>
  </div>
</template>

<style scoped>
.list-view h2 {
  margin-bottom: 12px;
  color: #2c3e50;
}

.desc {
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
  margin-bottom: 18px;
}

.add-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.add-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.add-bar input:focus {
  border-color: #42b983;
}

.add-btn {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #36a373;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.list li.done .item-text {
  text-decoration: line-through;
  color: #c0c4cc;
}

.list li.empty {
  justify-content: center;
  color: #c0c4cc;
  font-style: italic;
}

.item-text {
  flex: 1;
  font-size: 14px;
}

.del-btn {
  background: transparent;
  border: 1px solid #f56c6c;
  color: #f56c6c;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.del-btn:hover {
  background: #f56c6c;
  color: #fff;
}

.footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

.clear-btn {
  background: transparent;
  border: 1px solid #e6a23c;
  color: #e6a23c;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background: #e6a23c;
  color: #fff;
}
</style>
