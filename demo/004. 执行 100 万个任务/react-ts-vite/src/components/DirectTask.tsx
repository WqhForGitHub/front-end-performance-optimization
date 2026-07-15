import { useState, useCallback, useRef } from 'react'
import { executeTask, fmtMs } from '../utils/task'

const TOTAL = 1_000_000

/**
 * 方法一：直接执行（baseline）
 * 同步循环执行 100 万个任务，主线程完全阻塞，页面卡死。
 * 仅用于对比，实际项目中绝不要这样做。
 */
export default function DirectTask() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ sum: number; elapsed: number } | null>(null)
  const startTimeRef = useRef(0)

  const handleRun = useCallback(() => {
    setRunning(true)
    setResult(null)

    // 用 setTimeout 让 UI 先渲染 running 状态
    setTimeout(() => {
      const startTime = performance.now()
      let sum = 0

      // 同步执行所有任务 -- 页面会卡死
      for (let i = 0; i < TOTAL; i++) {
        sum += executeTask(i)
      }

      const elapsed = performance.now() - startTime
      startTimeRef.current = elapsed
      setResult({ sum, elapsed })
      setRunning(false)
    }, 50)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 14 }}>
        方法一：直接同步执行。主线程被 100 万次循环完全阻塞，期间页面无法响应任何交互。
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        style={{
          padding: '8px 20px',
          background: running ? '#ccc' : '#ff4d4f',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: running ? 'not-allowed' : 'pointer',
          fontSize: 14,
        }}
      >
        {running ? '执行中...（页面卡死）' : '开始执行 100 万个任务'}
      </button>

      {running && (
        <div style={{ marginTop: 16, color: '#ff4d4f', fontSize: 14 }}>
          正在同步执行，页面已冻结。请尝试点击其他按钮或移动鼠标...
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 16,
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
            总耗时: <strong style={{ color: '#ff4d4f' }}>{fmtMs(result.elapsed)}</strong>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>计算结果: {result.sum.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            注意：执行期间页面完全无响应，这正是主线程阻塞的表现。
          </div>
        </div>
      )}
    </div>
  )
}
