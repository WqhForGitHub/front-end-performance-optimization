import { useEffect, useRef, useState, CSSProperties } from 'react'
import { useRafThrottle } from '../hooks/useRafThrottle'

interface FpsStats {
  fps: number
  frames: number
  jankFrames: number
}

/**
 * 动画渲染优化演示
 * 对比三种方式驱动同一动画（小球左右往返）：
 * 1. setState + setInterval(10ms) - 高频 setState，触发大量重渲染，性能最差
 * 2. 直接操作 DOM + setInterval(16ms) - 不触发 React 重渲染，但可能与刷新不同步
 * 3. 直接操作 DOM + requestAnimationFrame - 与浏览器刷新同步，最流畅
 *
 * 用 FPS 和丢帧数（jank）量化对比。
 */
export default function AnimationDemo() {
  const [running, setRunning] = useState(false)
  const [statsA, setStatsA] = useState<FpsStats>({ fps: 0, frames: 0, jankFrames: 0 })
  const [statsB, setStatsB] = useState<FpsStats>({ fps: 0, frames: 0, jankFrames: 0 })
  const [statsC, setStatsC] = useState<FpsStats>({ fps: 0, frames: 0, jankFrames: 0 })

  // 方式1：setState + setInterval
  const [posA, setPosA] = useState(0)
  const dirA = useRef(1)
  const statsARef = useRef({
    frames: 0,
    jank: 0,
    lastTime: performance.now(),
    lastFpsTime: performance.now(),
    fps: 0,
  })
  const intervalARef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 方式2：DOM + setInterval
  const boxBRef = useRef<HTMLDivElement | null>(null)
  const posB = useRef(0)
  const dirB = useRef(1)
  const statsBRef = useRef({
    frames: 0,
    jank: 0,
    lastTime: performance.now(),
    lastFpsTime: performance.now(),
    fps: 0,
  })
  const intervalBRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 方式3：DOM + requestAnimationFrame
  const boxCRef = useRef<HTMLDivElement | null>(null)
  const posC = useRef(0)
  const dirC = useRef(1)
  const statsCRef = useRef({
    frames: 0,
    jank: 0,
    lastTime: performance.now(),
    lastFpsTime: performance.now(),
    fps: 0,
  })
  const rafCRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) {
      // 停止所有
      if (intervalARef.current !== null) {
        clearInterval(intervalARef.current)
        intervalARef.current = null
      }
      if (intervalBRef.current !== null) {
        clearInterval(intervalBRef.current)
        intervalBRef.current = null
      }
      if (rafCRef.current !== null) {
        cancelAnimationFrame(rafCRef.current)
        rafCRef.current = null
      }
      return
    }

    const now = performance.now()
    statsARef.current = { frames: 0, jank: 0, lastTime: now, lastFpsTime: now, fps: 0 }
    statsBRef.current = { frames: 0, jank: 0, lastTime: now, lastFpsTime: now, fps: 0 }
    statsCRef.current = { frames: 0, jank: 0, lastTime: now, lastFpsTime: now, fps: 0 }

    // 方式1: setState + setInterval(10ms)
    intervalARef.current = setInterval(() => {
      const t = performance.now()
      const delta = t - statsARef.current.lastTime
      statsARef.current.lastTime = t
      statsARef.current.frames += 1
      if (delta > 20) statsARef.current.jank += 1

      setPosA((p) => {
        let next = p + dirA.current * 3
        if (next > 280) {
          next = 280
          dirA.current = -1
        }
        if (next < 0) {
          next = 0
          dirA.current = 1
        }
        return next
      })

      const elapsed = t - statsARef.current.lastFpsTime
      if (elapsed >= 1000) {
        statsARef.current.fps = Math.round((statsARef.current.frames * 1000) / elapsed)
        setStatsA({
          fps: statsARef.current.fps,
          frames: statsARef.current.frames,
          jankFrames: statsARef.current.jank,
        })
        statsARef.current.lastFpsTime = t
      }
    }, 10)

    // 方式2: DOM + setInterval(16ms)
    intervalBRef.current = setInterval(() => {
      const t = performance.now()
      const delta = t - statsBRef.current.lastTime
      statsBRef.current.lastTime = t
      statsBRef.current.frames += 1
      if (delta > 20) statsBRef.current.jank += 1

      let next = posB.current + dirB.current * 3
      if (next > 280) {
        next = 280
        dirB.current = -1
      }
      if (next < 0) {
        next = 0
        dirB.current = 1
      }
      posB.current = next
      if (boxBRef.current) boxBRef.current.style.transform = `translateX(${next}px)`

      const elapsed = t - statsBRef.current.lastFpsTime
      if (elapsed >= 1000) {
        statsBRef.current.fps = Math.round((statsBRef.current.frames * 1000) / elapsed)
        setStatsB({
          fps: statsBRef.current.fps,
          frames: statsBRef.current.frames,
          jankFrames: statsBRef.current.jank,
        })
        statsBRef.current.lastFpsTime = t
      }
    }, 16)

    // 方式3: DOM + requestAnimationFrame
    const tickC = () => {
      const t = performance.now()
      const delta = t - statsCRef.current.lastTime
      statsCRef.current.lastTime = t
      statsCRef.current.frames += 1
      if (delta > 20) statsCRef.current.jank += 1

      let next = posC.current + dirC.current * 3
      if (next > 280) {
        next = 280
        dirC.current = -1
      }
      if (next < 0) {
        next = 0
        dirC.current = 1
      }
      posC.current = next
      if (boxCRef.current) boxCRef.current.style.transform = `translateX(${next}px)`

      const elapsed = t - statsCRef.current.lastFpsTime
      if (elapsed >= 1000) {
        statsCRef.current.fps = Math.round((statsCRef.current.frames * 1000) / elapsed)
        setStatsC({
          fps: statsCRef.current.fps,
          frames: statsCRef.current.frames,
          jankFrames: statsCRef.current.jank,
        })
        statsCRef.current.lastFpsTime = t
      }
      rafCRef.current = requestAnimationFrame(tickC)
    }
    rafCRef.current = requestAnimationFrame(tickC)

    return () => {
      if (intervalARef.current !== null) {
        clearInterval(intervalARef.current)
        intervalARef.current = null
      }
      if (intervalBRef.current !== null) {
        clearInterval(intervalBRef.current)
        intervalBRef.current = null
      }
      if (rafCRef.current !== null) {
        cancelAnimationFrame(rafCRef.current)
        rafCRef.current = null
      }
    }
  }, [running])

  const wrapperStyle: CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  const titleStyle: CSSProperties = {
    margin: '0 0 8px 0',
    fontSize: '17px',
    fontWeight: 700,
    color: '#333',
  }

  const descStyle: CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
  }

  const btnStyle: CSSProperties = {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: running ? '#f44336' : '#1976d2',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '16px',
  }

  const trackStyle: CSSProperties = {
    position: 'relative',
    width: '310px',
    height: '40px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    margin: '8px 0',
    overflow: 'hidden',
  }

  const ballStyle = (color: string): CSSProperties => ({
    position: 'absolute',
    left: '0',
    top: '5px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: color,
    willChange: 'transform',
  })

  const laneStyle: CSSProperties = {
    marginBottom: '16px',
  }

  const laneTitleStyle = (color: string): CSSProperties => ({
    fontSize: '13px',
    fontWeight: 700,
    color,
    marginBottom: '4px',
  })

  const statsLine: CSSProperties = {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  }

  const statItem = (color: string): CSSProperties => ({
    color,
    fontWeight: 600,
  })

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>动画渲染优化对比</h3>
      <p style={descStyle}>
        点击「开始动画」让三个小球同时左右往返移动，对比三种驱动方式。方式1 用 setState
        高频更新会触发大量 React 重渲染； 方式2/3 直接操作 DOM 跳过 React。requestAnimationFrame
        与屏幕刷新同步，应是最流畅、丢帧最少。
      </p>
      <button style={btnStyle} onClick={() => setRunning((r) => !r)}>
        {running ? '停止动画' : '开始动画'}
      </button>

      <div style={laneStyle}>
        <div style={laneTitleStyle('#f44336')}>方式1：setState + setInterval(10ms)</div>
        <div style={trackStyle}>
          <div style={{ ...ballStyle('#f44336'), transform: `translateX(${posA}px)` }} />
        </div>
        <div style={statsLine}>
          <span>
            FPS:{' '}
            <span style={statItem(statsA.fps >= 50 ? '#4caf50' : '#f44336')}>{statsA.fps}</span>
          </span>
          <span>总帧数: {statsA.frames}</span>
          <span>
            丢帧(&gt;20ms):{' '}
            <span style={statItem(statsA.jankFrames > 5 ? '#f44336' : '#4caf50')}>
              {statsA.jankFrames}
            </span>
          </span>
        </div>
      </div>

      <div style={laneStyle}>
        <div style={laneTitleStyle('#ff9800')}>方式2：DOM 直操作 + setInterval(16ms)</div>
        <div style={trackStyle}>
          <div ref={boxBRef} style={ballStyle('#ff9800')} />
        </div>
        <div style={statsLine}>
          <span>
            FPS:{' '}
            <span style={statItem(statsB.fps >= 50 ? '#4caf50' : '#f44336')}>{statsB.fps}</span>
          </span>
          <span>总帧数: {statsB.frames}</span>
          <span>
            丢帧(&gt;20ms):{' '}
            <span style={statItem(statsB.jankFrames > 5 ? '#f44336' : '#4caf50')}>
              {statsB.jankFrames}
            </span>
          </span>
        </div>
      </div>

      <div style={laneStyle}>
        <div style={laneTitleStyle('#4caf50')}>
          方式3：DOM 直操作 + requestAnimationFrame（推荐）
        </div>
        <div style={trackStyle}>
          <div ref={boxCRef} style={ballStyle('#4caf50')} />
        </div>
        <div style={statsLine}>
          <span>
            FPS:{' '}
            <span style={statItem(statsC.fps >= 50 ? '#4caf50' : '#f44336')}>{statsC.fps}</span>
          </span>
          <span>总帧数: {statsC.frames}</span>
          <span>
            丢帧(&gt;20ms):{' '}
            <span style={statItem(statsC.jankFrames > 5 ? '#f44336' : '#4caf50')}>
              {statsC.jankFrames}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
