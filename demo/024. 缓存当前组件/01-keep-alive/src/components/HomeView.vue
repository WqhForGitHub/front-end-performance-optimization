<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const props = defineProps<{ tabName: string }>()
const emit = defineEmits<{ (e: 'lifecycle', payload: { tab: string; event: string }): void }>()

const counter = ref(0)
const mountedTime = ref<string>('')
const activatedCount = ref(0)
const lastActivated = ref<string>('')

function now() {
  const d = new Date()
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

onMounted(() => {
  mountedTime.value = now()
  emit('lifecycle', { tab: props.tabName, event: 'onMounted' })
})

onUnmounted(() => {
  emit('lifecycle', { tab: props.tabName, event: 'onUnmounted' })
})

onActivated(() => {
  activatedCount.value++
  lastActivated.value = now()
  emit('lifecycle', { tab: props.tabName, event: 'onActivated' })
})

onDeactivated(() => {
  emit('lifecycle', { tab: props.tabName, event: 'onDeactivated' })
})

function increment() {
  counter.value++
}
</script>

<template>
  <div class="home-view">
    <h2>首页</h2>
    <p class="desc">
      这里有一个计数器，切换到其他 Tab 再切回来，计数器的值会被保留（不会重置为 0）。
      同时观察右下角的日志：<code>onActivated</code> 会触发，但 <code>onMounted</code> 只会触发一次。
    </p>

    <div class="counter-card">
      <div class="counter-value">{{ counter }}</div>
      <button class="btn" @click="increment">+1 计数</button>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="label">首次挂载时间</span>
        <span class="value">{{ mountedTime || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">被激活次数</span>
        <span class="value">{{ activatedCount }}</span>
      </div>
      <div class="info-item">
        <span class="label">最近一次激活</span>
        <span class="value">{{ lastActivated || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view h2 {
  margin-bottom: 12px;
  color: #2c3e50;
}

.desc {
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
  margin-bottom: 20px;
}

.counter-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 28px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.counter-value {
  font-size: 56px;
  font-weight: bold;
  margin-bottom: 12px;
}

.btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-item {
  background: #f5f7fa;
  padding: 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item .label {
  font-size: 12px;
  color: #909399;
}

.info-item .value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
  font-family: 'Consolas', monospace;
}
</style>
