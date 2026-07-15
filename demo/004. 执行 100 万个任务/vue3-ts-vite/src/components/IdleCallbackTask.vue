<template>
  <div>
    <div style="margin-bottom: 12px; color: #888; font-size: 14px">
      方法三：requestIdleCallback。利用浏览器空闲时间执行任务，不与动画和交互争抢 CPU。
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 12px">
      <button
        :disabled="running"
        :style="{
          padding: '8px 20px',
          background: running ? '#ccc' : '#722ed1',
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
            background: 'linear-gradient(90deg, #722ed1, #9254de)',
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
      <div style="font-size: 12px; color: #999; text-align: center; margin-top: 4px">
        利用空闲时间执行，速度较慢但不影响页面交互
      </div>
    </div>

    <div
      v-if="result"
      style="padding: 16px; background: #f9f0ff; border: 1px solid #d3adf7; border-radius: 6px"
    >
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px">执行完成</div>
      <div style="font-size: 14px; color: #555">
        总任务数: <strong>{{ total.toLocaleString() }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">
        总耗时: <strong style="color: #722ed1">{{ fmtMs(result.elapsed) }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">计算结果: {{ result.sum.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { executeTask, fmtMs, fmtPct } from '../utils/task'

const TOTAL = 1_000_000

/** requestIdleCallback 兼容类型 */
interface IdleDeadlineLike {
  didTimeout: boolean
  timeRemaining: () => number
}

type IdleCallbackLike = (deadline: IdleDeadlineLike) => void

const ric: (cb: IdleCallbackLike, opts?: { timeout: number }) => number =
  (window as unknown as { requestIdleCallback?: typeof ric }).requestIdleCallback ||
  function (cb: IdleCallbackLike, opts?: { timeout: number }) {
    const start = Date.now()
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      })
    }, opts?.timeout || 1) as unknown as number
  }

const cic: (handle: number) => void =
  (window as unknown as { cancelIdleCallback?: typeof cic }).cancelIdleCallback ||
  function (handle: number) {
    clearTimeout(handle)
  }

const total = TOTAL
const running = ref(false)
const progress = ref(0)
const result = ref<{ sum: number; elapsed: number } | null>(null)
let idleId: number | null = null

function handleRun() {
  running.value = true
  progress.value = 0
  result.value = null

  const startTime = performance.now()
  let completed = 0
  let sum = 0

  const runIdle = (deadline: IdleDeadlineLike) => {
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && completed < TOTAL) {
      const chunkEnd = Math.min(completed + 1000, TOTAL)
      for (let i = completed; i < chunkEnd; i++) {
        sum += executeTask(i)
      }
      completed = chunkEnd
    }

    progress.value = completed

    if (completed < TOTAL) {
      idleId = ric(runIdle, { timeout: 1000 })
    } else {
      const elapsed = performance.now() - startTime
      result.value = { sum, elapsed }
      running.value = false
    }
  }

  idleId = ric(runIdle, { timeout: 1000 })
}

function handleCancel() {
  if (idleId !== null) {
    cic(idleId)
    idleId = null
  }
  running.value = false
}

onBeforeUnmount(() => {
  handleCancel()
})
</script>
