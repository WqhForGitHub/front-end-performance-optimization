<template>
  <div>
    <div style="margin-bottom: 12px; color: #888; font-size: 14px">
      方法二：setTimeout 分片。每批执行 {{ chunkSize.toLocaleString() }} 个任务后用 setTimeout
      让出主线程，页面保持响应。
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 12px">
      <button
        :disabled="running"
        :style="{
          padding: '8px 20px',
          background: running ? '#ccc' : '#1677ff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: running ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }"
        @click="handleRun"
      >
        {{ running ? '执行中...' : '开始执行' }}
      </button>
      <button
        v-if="running"
        :style="{
          padding: '8px 20px',
          background: '#fff',
          color: '#ff4d4f',
          border: '1px solid #ff4d4f',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }"
        @click="handleCancel"
      >
        取消
      </button>
    </div>

    <div v-if="running" style="margin-bottom: 12px">
      <div style="height: 24px; background: #f0f0f0; border-radius: 12px; overflow: hidden">
        <div
          :style="{
            height: '100%',
            width: (progress / total) * 100 + '%',
            background: 'linear-gradient(90deg, #1677ff, #4096ff)',
            borderRadius: '12px',
            transition: 'width 0.1s',
          }"
        />
      </div>
      <div style="text-align: center; font-size: 13px; color: #666; margin-top: 4px">
        {{ progress.toLocaleString() }} / {{ total.toLocaleString() }} ({{
          fmtPct(progress, total)
        }})
      </div>
    </div>

    <div
      style="
        padding: 12px;
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        border-radius: 6px;
        margin-bottom: 12px;
      "
    >
      <input
        type="text"
        placeholder="试试在执行过程中输入文字..."
        style="
          width: 100%;
          padding: 8px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
        "
      />
      <div style="font-size: 12px; color: #999; margin-top: 4px">
        执行期间输入框应保持响应，不会卡顿
      </div>
    </div>

    <div
      v-if="result"
      style="padding: 16px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px"
    >
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px">执行完成</div>
      <div style="font-size: 14px; color: #555">
        总任务数: <strong>{{ total.toLocaleString() }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">
        总耗时: <strong style="color: #1677ff">{{ fmtMs(result.elapsed) }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">计算结果: {{ result.sum.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { executeTask, fmtMs, fmtPct } from '../utils/task'

const TOTAL = 1_000_000
const CHUNK_SIZE = 5000

const total = TOTAL
const chunkSize = CHUNK_SIZE
const running = ref(false)
const progress = ref(0)
const result = ref<{ sum: number; elapsed: number } | null>(null)
let cancelled = false

function handleRun() {
  running.value = true
  progress.value = 0
  result.value = null
  cancelled = false

  const startTime = performance.now()
  let completed = 0
  let sum = 0

  const runChunk = () => {
    if (cancelled) return

    const end = Math.min(completed + CHUNK_SIZE, TOTAL)
    for (let i = completed; i < end; i++) {
      sum += executeTask(i)
    }
    completed = end
    progress.value = completed

    if (completed < TOTAL) {
      setTimeout(runChunk, 0)
    } else {
      const elapsed = performance.now() - startTime
      result.value = { sum, elapsed }
      running.value = false
    }
  }

  setTimeout(runChunk, 0)
}

function handleCancel() {
  cancelled = true
  running.value = false
}
</script>
