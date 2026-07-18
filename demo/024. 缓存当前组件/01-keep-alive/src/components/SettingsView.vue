<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const props = defineProps<{ tabName: string }>()
const emit = defineEmits<{ (e: 'lifecycle', payload: { tab: string; event: string }): void }>()

interface Setting {
  key: string
  label: string
  value: boolean
}

const settings = ref<Setting[]>([
  { key: 'notify', label: '消息通知', value: true },
  { key: 'sound', label: '声音提醒', value: false },
  { key: 'auto-update', label: '自动更新', value: true },
  { key: 'dark-mode', label: '深色模式', value: false },
  { key: 'analytics', label: '使用数据上报', value: true },
])

onMounted(() => emit('lifecycle', { tab: props.tabName, event: 'onMounted' }))
onUnmounted(() => emit('lifecycle', { tab: props.tabName, event: 'onUnmounted' }))
onActivated(() => emit('lifecycle', { tab: props.tabName, event: 'onActivated' }))
onDeactivated(() => emit('lifecycle', { tab: props.tabName, event: 'onDeactivated' }))

function toggle(setting: Setting) {
  setting.value = !setting.value
}
</script>

<template>
  <div class="settings-view">
    <h2>设置</h2>
    <p class="desc">
      切换这些开关状态后离开本 Tab，再切回来，开关状态会被完整保留。 这展示了 KeepAlive
      对组件内部响应式状态的缓存能力。
    </p>

    <ul class="settings-list">
      <li v-for="setting in settings" :key="setting.key">
        <span class="label">{{ setting.label }}</span>
        <button
          class="switch"
          :class="{ on: setting.value }"
          :aria-pressed="setting.value"
          @click="toggle(setting)"
        >
          <span class="thumb"></span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.settings-view h2 {
  margin-bottom: 12px;
  color: #2c3e50;
}

.desc {
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
  margin-bottom: 20px;
}

.settings-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.settings-list li:hover {
  background: #ecf0f3;
}

.label {
  font-size: 14px;
  color: #2c3e50;
}

.switch {
  width: 44px;
  height: 24px;
  background: #c0ccda;
  border: none;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}

.switch.on {
  background: #42b983;
}

.switch .thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch.on .thumb {
  transform: translateX(20px);
}
</style>
