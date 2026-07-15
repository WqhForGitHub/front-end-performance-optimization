<template>
  <div>
    <div style="margin-bottom: 12px; color: #888; font-size: 14px">
      方法一：直接同步执行。主线程被 100 万次循环完全阻塞，期间页面无法响应任何交互。
    </div>

    <button
      :disabled="running"
      :style="{
        padding: '8px 20px',
        background: running ? '#ccc' : '#ff4d4f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: running ? 'not-allowed' : 'pointer',
        fontSize: '14px',
      }"
      @click="handleRun"
    >
      {{ running ? '执行中...（页面卡死）' : '开始执行 100 万个任务' }}
    </button>

    <div v-if="running" style="margin-top: 16px; color: #ff4d4f; font-size: 14px">
      正在同步执行，页面已冻结。请尝试点击其他按钮或移动鼠标...
    </div>

    <div
      v-if="result"
      style="
        margin-top: 16px;
        padding: 16px;
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        border-radius: 6px;
      "
    >
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px">执行完成</div>
      <div style="font-size: 14px; color: #555">
        总任务数: <strong>{{ total.toLocaleString() }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">
        总耗时: <strong style="color: #ff4d4f">{{ fmtMs(result.elapsed) }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">计算结果: {{ result.sum.toFixed(2) }}</div>
      <div style="font-size: 12px; color: #999; margin-top: 8px">
        注意：执行期间页面完全无响应，这正是主线程阻塞的表现。
      </div>
    </div>
  </div>
</template>

<script>
import { executeTask, fmtMs } from '../utils/task'

const TOTAL = 1000000

export default {
  name: 'DirectTask',
  data() {
    return {
      total: TOTAL,
      running: false,
      result: null,
    }
  },
  methods: {
    fmtMs,
    handleRun() {
      this.running = true
      this.result = null

      // 用 setTimeout 让 UI 先渲染 running 状态
      setTimeout(() => {
        const startTime = performance.now()
        let sum = 0

        // 同步执行所有任务 -- 页面会卡死
        for (let i = 0; i < TOTAL; i++) {
          sum += executeTask(i)
        }

        const elapsed = performance.now() - startTime
        this.result = { sum, elapsed }
        this.running = false
      }, 50)
    },
  },
}
</script>
