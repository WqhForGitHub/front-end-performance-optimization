import { useState, useCallback, useRef, useEffect } from 'react'
import { fmtMs, fmtPct } from '../utils/task'

const TOTAL = 1_000_000

/** Worker 消息类型 */
interface WorkerMessage {
  type: 'progress' | 'complete'
  completed: number
  total: number
  sum?: number
  elapsed?: number
}

/**
 * 方法四：Web Worker
 * 将 100 万个任务放到 Web Worker 的独立线程中执行。
 * 主线程完全不受影响，页面交互丝滑流畅。
 *
 * 优点：
 *   - 真正的并行执行，不阻塞主线程
 *   - 可以利用多核 CPU
 *   - 主线程 60fps 流畅运行
 *
 * 缺点：
 *   - 需要额外创建 Worker 线程
 *   - 通信有序列化开销（postMessage）
 *   - Worker 中不能操作 DOM
 */
export default function WorkerTask() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ sum: number; elapsed: number } | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // 清理 Worker
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const handleRun = useCallback(() => {
    setRunning(true)
    setProgress(0)
    setResult(null)

    // 创建 Worker（Vite 的 Worker 导入语法）
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const data = e.data
      if (data.type === 'progress') {
        setProgress(data.completed)
      } else if (data.type === 'complete') {
        setProgress(data.completed)
        setResult({ sum: data.sum || 0, elapsed: data.elapsed || 0 })
        setRunning(false)
        worker.terminate()
        workerRef.current = null
      }
    }

    worker.onerror = (err) => {
      console.error('Worker error:', err)
      setRunning(false)
    }

    // 发送开始命令
    worker.postMessage({ type: 'start', total: TOTAL })
  }, [])

  const handleCancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    setRunning(false)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 14 }}>
        方法四：Web Worker。在独立线程中执行 100 万个任务，主线程零阻塞，页面交互完全流畅。
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            padding: '8px 20px',
            background: running ? '#ccc' : '#52c41a',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: running ? 'not-allowed' : 'pointer',
            fontSize: 14,
          }}
        >
          {running ? '执行中...' : '开始执行'}
        </button>
        {running && (
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 20px',
              background: '#fff',
              color: '#ff4d4f',
              border: '1px solid #ff4d4f',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            取消
          </button>
        )}
      </div>

      {running && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              height: 24,
              background: '#f0f0f0',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(progress / TOTAL) * 100}%`,
                background: 'linear-gradient(90deg, #52c41a, #73d13d)',
                borderRadius: 12,
                transition: 'width 0.1s',
              }}
            />
          </div>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 4 }}>
            {progress.toLocaleString()} / {TOTAL.toLocaleString()} ({fmtPct(progress, TOTAL)})
          </div>
        </div>
      )}

      {/* 交互测试区域 */}
      <div
        style={{
          padding: 12,
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
          marginBottom: 12,
        }}
      >
        <input
          type="text"
          placeholder="执行期间输入文字，完全无卡顿..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            fontSize: 14,
          }}
        />
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          Worker 在独立线程执行，主线程 60fps 流畅运行
        </div>
      </div>

      {result && (
        <div
          style={{
            padding: 16,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>执行完成</div>
          <div style={{ fontSize: 14, color: '#555' }}>
            总任务数: <strong>{TOTAL.toLocaleString()}</strong>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>
            总耗时: <strong style={{ color: '#52c41a' }}>{fmtMs(result.elapsed)}</strong>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>计算结果: {result.sum.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
