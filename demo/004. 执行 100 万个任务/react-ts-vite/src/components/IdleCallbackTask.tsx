import { useState, useCallback, useRef } from 'react'
import { executeTask, fmtMs, fmtPct } from '../utils/task'

const TOTAL = 1_000_000

/** requestIdleCallback 的兼容类型 */
type IdleDeadline = {
  didTimeout: boolean
  timeRemaining: () => number
}

type IdleCallback = (deadline: IdleDeadline) => void

// requestIdleCallback 兼容性处理
const ric: (cb: IdleCallback, opts?: { timeout: number }) => number =
  (window as unknown as { requestIdleCallback?: typeof ric }).requestIdleCallback ||
  function (cb: IdleCallback, opts?: { timeout: number }) {
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

/**
 * 方法三：requestIdleCallback
 * 利用浏览器空闲时间执行任务。浏览器会在每帧的空闲时间调用回调，
 * 通过 deadline.timeRemaining() 判断剩余空闲时间，充分利用空闲而不阻塞主线程。
 *
 * 优点：不与高优先级任务（动画、交互）争抢 CPU 时间
 * 缺点：执行速度取决于浏览器空闲程度，可能较慢
 */
export default function IdleCallbackTask() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ sum: number; elapsed: number } | null>(null)
  const rafRef = useRef<number | null>(null)

  const handleRun = useCallback(() => {
    setRunning(true)
    setProgress(0)
    setResult(null)

    const startTime = performance.now()
    let completed = 0
    let sum = 0

    const runIdle = (deadline: IdleDeadline) => {
      // 当还有空闲时间且任务未完成时，继续执行
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && completed < TOTAL) {
        const chunkEnd = Math.min(completed + 1000, TOTAL)
        for (let i = completed; i < chunkEnd; i++) {
          sum += executeTask(i)
        }
        completed = chunkEnd
      }

      setProgress(completed)

      if (completed < TOTAL) {
        // 注册下一帧的空闲回调
        rafRef.current = ric(runIdle, { timeout: 1000 })
      } else {
        const elapsed = performance.now() - startTime
        setResult({ sum, elapsed })
        setRunning(false)
      }
    }

    rafRef.current = ric(runIdle, { timeout: 1000 })
  }, [])

  const handleCancel = useCallback(() => {
    if (rafRef.current !== null) {
      cic(rafRef.current)
      rafRef.current = null
    }
    setRunning(false)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 14 }}>
        方法三：requestIdleCallback。利用浏览器空闲时间执行任务，不与动画和交互争抢 CPU。
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            padding: '8px 20px',
            background: running ? '#ccc' : '#722ed1',
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
                background: 'linear-gradient(90deg, #722ed1, #9254de)',
                borderRadius: 12,
                transition: 'width 0.1s',
              }}
            />
          </div>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 4 }}>
            {progress.toLocaleString()} / {TOTAL.toLocaleString()} ({fmtPct(progress, TOTAL)})
          </div>
          <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4 }}>
            利用空闲时间执行，速度较慢但不影响页面交互
          </div>
        </div>
      )}

      {result && (
        <div
          style={{
            padding: 16,
            background: '#f9f0ff',
            border: '1px solid #d3adf7',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>执行完成</div>
          <div style={{ fontSize: 14, color: '#555' }}>
            总任务数: <strong>{TOTAL.toLocaleString()}</strong>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>
            总耗时: <strong style={{ color: '#722ed1' }}>{fmtMs(result.elapsed)}</strong>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>计算结果: {result.sum.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
