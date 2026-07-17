<script lang="ts">
export default { name: 'OtherView' }
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const now = ref(new Date())
const timer = ref<number | null>(null)
const activatedCount = ref(0)
const lastEvent = ref('尚未触发事件')

function tick() {
  now.value = new Date()
}

function timeStr(d: Date) {
  return (
    d.toLocaleTimeString('zh-CN', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  )
}

onMounted(() => {
  lastEvent.value = `onMounted @ ${timeStr(new Date())}`
  // 只有激活时才启动定时器，避免缓存时仍占用资源
})

onActivated(() => {
  activatedCount.value++
  lastEvent.value = `onActivated @ ${timeStr(new Date())}`
  if (timer.value === null) {
    timer.value = window.setInterval(tick, 100)
  }
})

onDeactivated(() => {
  lastEvent.value = `onDeactivated @ ${timeStr(new Date())}`
  // 被缓存时清理定时器，这是 KeepAlive 场景下的最佳实践
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
})

onUnmounted(() => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
})
</script>

<template>
  <div class="other-view">
    <h2>其他页面</h2>
    <p class="desc">
      这是一个用于"切换离开"的辅助页面。它有一个实时时钟（每 100ms 更新），
      演示 KeepAlive 场景下的最佳实践：在 <code>onActivated</code> 启动定时器，
      在 <code>onDeactivated</code> 清理定时器，避免缓存期间浪费资源。
    </p>

    <div class="clock-card">
      <div class="clock">{{ timeStr(now) }}</div>
      <div class="label">当前时间（实时）</div>
    </div>

    <ul class="info">
      <li>累计被激活次数：<b>{{ activatedCount }}</b></li>
      <li>最近事件：<b class="event">{{ lastEvent }}</b></li>
    </ul>

    <div class="hint">
      现在切回"新闻列表" Tab，观察 NewsFeedView 是否触发了 <code>onActivated</code> 并刷新数据。
    </div>
  </div>
</template>

<style scoped>
.other-view h2 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  margin-bottom: 20px;
}

.desc code {
  background: #f0f2f5;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.clock-card {
  background: linear-gradient(135deg, #2c3e50, #4ca1af);
  color: #fff;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 18px;
}

.clock {
  font-size: 38px;
  font-weight: bold;
  font-family: 'Consolas', monospace;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.clock-card .label {
  font-size: 12px;
  opacity: 0.85;
}

.info {
  list-style: none;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f5f7fa;
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.info b {
  font-family: 'Consolas', monospace;
}

.info .event {
  color: #e6a23c;
}

.hint {
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 10px 14px;
  border-radius: 6px;
  line-height: 1.7;
}

.hint code {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}
</style>
