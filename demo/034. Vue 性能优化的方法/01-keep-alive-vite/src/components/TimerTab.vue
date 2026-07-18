<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'

const elapsed = ref(0)
const mountTime = ref<string>('')
let timer: number | null = null

onMounted(() => {
  mountTime.value = new Date().toLocaleTimeString()
  console.log('[TimerTab] onMounted - 计时器启动（仅一次）')
  timer = window.setInterval(() => {
    elapsed.value++
  }, 1000)
})

onActivated(() => {
  console.log('[TimerTab] onActivated - 计时器继续累计（保持运行）')
})

onDeactivated(() => {
  console.log('[TimerTab] onDeactivated - 计时器被缓存但仍在运行')
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  console.log('[TimerTab] onUnmounted - 计时器销毁（KeepAlive 下不会触发）')
})
</script>

<template>
  <div class="panel">
    <h3>计时器面板</h3>
    <p class="desc">计时器始终运行，切换 tab 回来后能看到累计秒数。</p>
    <div class="timer-display">
      已运行：<span class="seconds">{{ elapsed }}</span> 秒
    </div>
    <p class="mount-info">挂载时间：{{ mountTime }}</p>
    <p class="tip">提示：关闭 KeepAlive 后此组件会被销毁，计时归零。</p>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}
.timer-display {
  font-size: 20px;
  margin: 16px 0;
}
.seconds {
  font-size: 36px;
  font-weight: bold;
  color: #ef4444;
  padding: 0 8px;
}
.mount-info {
  color: #9ca3af;
  font-size: 12px;
}
.tip {
  color: #f59e0b;
  font-size: 13px;
  margin-top: 12px;
}
.desc {
  color: #6b7280;
  font-size: 14px;
}
</style>
