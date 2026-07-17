<script lang="ts">
export default { name: 'AlphaComp' }
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const counter = ref(0)
const mountedAt = ref('')
const activatedTimes = ref(0)
const lastEvent = ref('尚未触发任何事件')

function time() {
  const d = new Date()
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

onMounted(() => {
  mountedAt.value = time()
  lastEvent.value = `onMounted @ ${time()}（组件首次创建）`
})
onUnmounted(() => {
  lastEvent.value = `onUnmounted @ ${time()}（组件被销毁）`
})
onActivated(() => {
  activatedTimes.value++
  lastEvent.value = `onActivated @ ${time()}（从缓存恢复，未销毁）`
})
onDeactivated(() => {
  lastEvent.value = `onDeactivated @ ${time()}（被缓存，未销毁）`
})
</script>

<template>
  <div class="comp alpha">
    <div class="comp-head">
      <span class="tag">组件名：AlphaComp</span>
      <span class="color-label">Alpha</span>
    </div>
    <p class="desc">
      每次切换到本 Tab，观察下方的"最近事件"：
      <br />- 如果显示 <b>onActivated</b>，说明被缓存（计数器值保留）
      <br />- 如果显示 <b>onMounted</b>，说明未缓存（计数器被重置为 0）
    </p>
    <div class="counter-box">
      <span class="num">{{ counter }}</span>
      <button @click="counter++">+1</button>
    </div>
    <ul class="info">
      <li>首次挂载时间：<b>{{ mountedAt || '-' }}</b></li>
      <li>累计激活次数：<b>{{ activatedTimes }}</b></li>
      <li>最近事件：<b class="event">{{ lastEvent }}</b></li>
    </ul>
  </div>
</template>

<style scoped>
.comp {
  border-radius: 10px;
  padding: 20px;
  color: #fff;
}

.comp.alpha {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.comp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tag {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.25);
  padding: 3px 10px;
  border-radius: 12px;
  font-family: 'Consolas', monospace;
}

.color-label {
  font-size: 22px;
  font-weight: bold;
}

.desc {
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 16px;
  opacity: 0.95;
}

.counter-box {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.counter-box .num {
  font-size: 42px;
  font-weight: bold;
}

.counter-box button {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.counter-box button:hover {
  background: rgba(255, 255, 255, 0.4);
}

.info {
  list-style: none;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.15);
  padding: 12px 14px;
  border-radius: 8px;
}

.info b {
  font-family: 'Consolas', monospace;
}

.info .event {
  color: #ffeaa7;
}
</style>
