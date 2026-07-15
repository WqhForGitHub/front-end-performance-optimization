<template>
  <div>
    <div style="margin-bottom: 12px; color: #888; font-size: 14px">
      方法四：Web Worker。在独立线程中执行 100 万个任务，主线程零阻塞，页面交互完全流畅。
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 12px">
      <button
        :disabled="running"
        :style="{
          padding: '8px 20px',
          background: running ? '#ccc' : '#52c41a',
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
            background: 'linear-gradient(90deg, #52c41a, #73d13d)',
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
        placeholder="执行期间输入文字，完全无卡顿..."
        style="
          width: 100%;
          padding: 8px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
        "
      />
      <div style="font-size: 12px; color: #999; margin-top: 4px">
        Worker 在独立线程执行，主线程 60fps 流畅运行
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
        总耗时: <strong style="color: #52c41a">{{ fmtMs(result.elapsed) }}</strong>
      </div>
      <div style="font-size: 14px; color: #555">计算结果: {{ result.sum.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script>
import { fmtMs, fmtPct } from '../utils/task'

const TOTAL = 1000000

export default {
  name: 'WorkerTask',
  data() {
    return {
      total: TOTAL,
      running: false,
      progress: 0,
      result: null,
      worker: null,
    }
  },
  beforeDestroy() {
    this.handleCancel()
  },
  methods: {
    fmtMs,
    fmtPct,
    handleRun() {
      this.running = true
      this.progress = 0
      this.result = null

      // 创建 Worker
      const workerCode = `
        function executeTask(index) {
          var result = index
          result = (result * 9301 + 49297) % 233280
          result = Math.sqrt(result)
          return result
        }

        self.onmessage = function(e) {
          var type = e.data.type
          var total = e.data.total
          if (type !== 'start') return

          var startTime = performance.now()
          var sum = 0
          var PROGRESS_INTERVAL = 10000

          for (var i = 0; i < total; i++) {
            sum += executeTask(i)
            if ((i + 1) % PROGRESS_INTERVAL === 0) {
              self.postMessage({ type: 'progress', completed: i + 1, total: total })
            }
          }

          var elapsed = performance.now() - startTime
          self.postMessage({ type: 'complete', completed: total, total: total, sum: sum, elapsed: elapsed })
        }
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)
      this.worker = new Worker(workerUrl)

      this.worker.onmessage = (e) => {
        const data = e.data
        if (data.type === 'progress') {
          this.progress = data.completed
        } else if (data.type === 'complete') {
          this.progress = data.completed
          this.result = { sum: data.sum, elapsed: data.elapsed }
          this.running = false
          this.worker.terminate()
          this.worker = null
          URL.revokeObjectURL(workerUrl)
        }
      }

      this.worker.onerror = (err) => {
        console.error('Worker error:', err)
        this.running = false
      }

      this.worker.postMessage({ type: 'start', total: TOTAL })
    },
    handleCancel() {
      if (this.worker) {
        this.worker.terminate()
        this.worker = null
      }
      this.running = false
    },
  },
}
</script>
