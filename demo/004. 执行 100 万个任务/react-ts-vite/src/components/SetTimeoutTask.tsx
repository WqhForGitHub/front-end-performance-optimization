import { useState, useCallback, useRef } from 'react'
import { executeTask, fmtMs, fmtPct } from '../utils/task'

const TOTAL = 1_000_000
const CHUNK_SIZE = 5000 // 每批处理 5000 个

/**
 * 方法二：setTimeout 分片
 * 将 100 万个任务拆成小块，每块用 setTimeout(fn, 0) 让出主线程。
 * 浏览器有机会响应用户交互和渲染，页面不卡顿。
 */
export default function SetTimeoutTask() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ sum: number; elapsed: number } | null>(null)
  const cancelRef = useRef(false)

  const handleRun = useCallback(() => {
    setRunning(true)
    setProgress(0)
    setResult(null)
    cancelRef.current = false

    const startTime = performance.now()
    let completed = 0
    let sum = 0

    const runChunk = () => {
      if (cancelRef.current) return

      const end = Math.min(completed + CHUNK_SIZE, TOTAL)
      for (let i = completed; i < end; i++) {
        sum += executeTask(i)
      }
      completed = end
      setProgress(completed)

      if (completed < TOTAL) {
        // 用 setTimeout 让出主线程，让浏览器有机会处理 UI 交互
        setTimeout(runChunk, 0)
      } else {
        const elapsed = performance.now() - startTime
        setResult({ sum, elapsed })
        setRunning(false)
      }
    }

    setTimeout(runChunk, 0)
  }, [])

  const handleCancel = useCallback(() => {
    cancelRef.current = true
    setRunning(false)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 14 }}>
        方法二：setTimeout 分片。每批执行 {CHUNK_SIZE.toLocaleString()} 个任务后用 setTimeout
        让出主线程， 页面保持响应。
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            padding: '8px 20px',
            background: running ? '#ccc' : '#1677ff',
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

      {/* 进度条 */}
      {running && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              height: 24,
              background: '#f0f0f0',
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(progress / TOTAL) * 100}%`,
                background: 'linear-gradient(90deg, #1677ff, #4096ff)',
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
          placeholder="试试在执行过程中输入文字..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            fontSize: 14,
          }}
        />
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          执行期间输入框应保持响应，不会卡顿
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
            总耗时: <strong style={{ color: '#1677ff' }}>{fmtMs(result.elapsed)}</strong>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>计算结果: {result.sum.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
