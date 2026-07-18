// FPS 测量：Frame Timing API 方式
// 使用 performance.getEntriesByType('frame') 读取每帧细节
// 该 API 在主流浏览器中尚未广泛实现，因此提供 rAF 回退方案
// 同时在本页面并行运行三种方式做对比

// Frame Timing 规范中每帧条目可能包含的字段（非标准，浏览器未实现）
interface FrameTimingLike extends PerformanceEntry {
  duration: number
  mainThreadTime?: number
  compositorTime?: number
  rendererMainTime?: number
}

const frameSupportedEl = document.getElementById('frame-supported') as HTMLDivElement
const frameDurationEl = document.getElementById('frame-duration') as HTMLSpanElement
const mainThreadTimeEl = document.getElementById('main-thread-time') as HTMLSpanElement
const compositorTimeEl = document.getElementById('compositor-time') as HTMLSpanElement
const frameCountEl = document.getElementById('frame-count') as HTMLSpanElement
const compare1El = document.getElementById('compare-1') as HTMLSpanElement
const compare2El = document.getElementById('compare-2') as HTMLSpanElement
const compare3El = document.getElementById('compare-3') as HTMLSpanElement
const compare3SupportEl = document.getElementById('compare-3-support') as HTMLTableCellElement

function getFrameEntries(): FrameTimingLike[] {
  try {
    return performance.getEntriesByType('frame') as FrameTimingLike[]
  } catch {
    return []
  }
}

function checkFrameTimingSupport(): boolean {
  try {
    // 仅当 API 存在且能返回数组时认为"可调用"
    const entries = performance.getEntriesByType('frame')
    return Array.isArray(entries)
  } catch {
    return false
  }
}

const frameTimingCallable = checkFrameTimingSupport()

// 进一步判断是否真的有数据（多数浏览器可调用但永远返回空数组）
let frameDataEverReceived = false

if (frameTimingCallable) {
  frameSupportedEl.textContent = 'performance.getEntriesByType("frame") 可调用。等待帧数据中...'
  frameSupportedEl.className = 'support-banner supported'
  compare3SupportEl.textContent = '可调用'
} else {
  frameSupportedEl.textContent =
    '当前浏览器未实现 Frame Timing API，下面使用 rAF 回退估算帧时长（读数带 * 标记）。'
  frameSupportedEl.className = 'support-banner not-supported'
  compare3SupportEl.textContent = '未支持'
}

// rAF 测量（始终运行，用于方式一与回退）
let lastFrameTime = 0
let frameCounter = 0
let lastFpsCheck = performance.now()
let rafFps = 0
const recentDeltas: number[] = []

// PerformanceObserver 监听 longtask（方式二的对比数据）
let longTaskCount = 0
try {
  const observer = new PerformanceObserver((list) => {
    longTaskCount += list.getEntries().length
  })
  observer.observe({ entryTypes: ['longtask'] })
} catch {
  // 不支持时忽略
}

function classifyValue(fps: number): string {
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'warn'
  return 'bad'
}

function classifyDuration(ms: number): string {
  if (ms <= 17) return 'good'
  if (ms <= 33) return 'warn'
  return 'bad'
}

function loop(now: number): void {
  // 记录每帧 delta（用于回退估算）
  if (lastFrameTime > 0) {
    const delta = now - lastFrameTime
    if (delta > 0 && delta < 1000) {
      recentDeltas.push(delta)
      if (recentDeltas.length > 60) recentDeltas.shift()
    }
  }
  lastFrameTime = now
  frameCounter++
  if (now - lastFpsCheck >= 500) {
    rafFps = (frameCounter * 1000) / (now - lastFpsCheck)
    frameCounter = 0
    lastFpsCheck = now
  }

  // 方式一：requestAnimationFrame
  compare1El.textContent = rafFps.toFixed(1) + ' FPS'

  // 方式二：PerformanceObserver (longtask)
  compare2El.textContent = longTaskCount + ' tasks'

  // 方式三：Frame Timing API
  if (frameTimingCallable) {
    const entries = getFrameEntries()
    if (entries.length > 0) {
      if (!frameDataEverReceived) {
        frameDataEverReceived = true
        compare3SupportEl.textContent = '已支持'
        frameSupportedEl.textContent = 'Frame Timing API 已支持，正在接收每帧数据。'
      }
      frameCountEl.textContent = String(entries.length)
      const recent = entries.slice(-30)
      let totalDuration = 0
      let totalMain = 0
      let totalCompositor = 0
      let mainCount = 0
      let compositorCount = 0
      for (const e of recent) {
        totalDuration += e.duration
        if (typeof e.mainThreadTime === 'number') {
          totalMain += e.mainThreadTime
          mainCount++
        }
        if (typeof e.compositorTime === 'number') {
          totalCompositor += e.compositorTime
          compositorCount++
        }
      }
      const avgDuration = totalDuration / recent.length
      frameDurationEl.textContent = avgDuration.toFixed(2) + ' ms'
      frameDurationEl.className = 'metric-value ' + classifyDuration(avgDuration)
      mainThreadTimeEl.textContent =
        mainCount > 0 ? (totalMain / mainCount).toFixed(2) + ' ms' : 'N/A'
      compositorTimeEl.textContent =
        compositorCount > 0 ? (totalCompositor / compositorCount).toFixed(2) + ' ms' : 'N/A'
      const fps = 1000 / avgDuration
      compare3El.textContent = fps.toFixed(1) + ' FPS'
    } else if (!frameDataEverReceived) {
      // API 可调用但暂无数据，先用 rAF 回退显示
      updateFallback()
    }
  } else {
    updateFallback()
  }

  requestAnimationFrame(loop)
}

function updateFallback(): void {
  if (recentDeltas.length === 0) return
  let sum = 0
  for (const d of recentDeltas) sum += d
  const avg = sum / recentDeltas.length
  frameDurationEl.textContent = avg.toFixed(2) + ' ms'
  frameDurationEl.className = 'metric-value ' + classifyDuration(avg)
  mainThreadTimeEl.textContent = 'N/A'
  compositorTimeEl.textContent = 'N/A'
  frameCountEl.textContent = String(recentDeltas.length)
  const fps = 1000 / avg
  compare3El.textContent = fps.toFixed(1) + ' FPS*'
}

requestAnimationFrame(loop)
