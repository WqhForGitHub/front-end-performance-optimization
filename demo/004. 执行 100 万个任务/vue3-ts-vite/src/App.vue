<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 800px; margin: 0 auto">
    <h2>Vue3 + TS + Vite - 执行 100 万个任务</h2>
    <p style="color: #888; font-size: 14px; margin-bottom: 20px">
      演示在浏览器中执行 100 万个计算任务时，不同方案对页面流畅度的影响。
    </p>

    <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :style="{
          padding: '8px 16px',
          background: method === tab.key ? '#1677ff' : '#fff',
          color: method === tab.key ? '#fff' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }"
        @click="method = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      style="
        margin-bottom: 20px;
        padding: 10px 16px;
        background: #f5f5f5;
        border-radius: 6px;
        color: #666;
        font-size: 14px;
      "
    >
      {{ currentDesc }}
    </div>

    <div style="padding: 20px; border: 1px solid #e8e8e8; border-radius: 8px; background: #fff">
      <DirectTask v-if="method === 'direct'" />
      <SetTimeoutTask v-else-if="method === 'setTimeout'" />
      <IdleCallbackTask v-else-if="method === 'idleCallback'" />
      <WorkerTask v-else-if="method === 'worker'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DirectTask from './components/DirectTask.vue'
import SetTimeoutTask from './components/SetTimeoutTask.vue'
import IdleCallbackTask from './components/IdleCallbackTask.vue'
import WorkerTask from './components/WorkerTask.vue'

type Method = 'direct' | 'setTimeout' | 'idleCallback' | 'worker'

const method = ref<Method>('worker')

const tabs: { key: Method; label: string; desc: string }[] = [
  { key: 'direct', label: '方法一: 直接执行', desc: '同步循环，主线程完全阻塞（对比用）' },
  { key: 'setTimeout', label: '方法二: setTimeout 分片', desc: '分批执行 + setTimeout 让出主线程' },
  { key: 'idleCallback', label: '方法三: requestIdleCallback', desc: '利用浏览器空闲时间执行' },
  { key: 'worker', label: '方法四: Web Worker', desc: '独立线程执行，主线程零阻塞（推荐）' },
]

const currentDesc = computed(() => tabs.find((t) => t.key === method.value)?.desc ?? '')
</script>
