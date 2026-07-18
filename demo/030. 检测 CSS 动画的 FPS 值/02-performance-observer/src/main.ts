// FPS / 卡顿测量：PerformanceObserver (longtask) 方式
// longtask 会在主线程任务执行超过 50ms 时触发，可用于检测卡顿并估算丢帧
// 由于 longtask 不直接提供 FPS，这里用 rAF 并行估算实时 FPS

const fpsValueEl = document.getElementById('fps-value') as HTMLSpanElement
const longTaskCountEl = document.getElementById('long-task-count') as HTMLSpanElement
const droppedFramesEl = document.getElementById('dropped-frames') as HTMLSpanElement
const jankWarningEl = document.getElementById('jank-warning') as HTMLDivElement
const jankListEl = document.getElementById('jank-list') as HTMLDivElement
const toggleJankBtn = document.getElementById('toggle-jank-btn') as HTMLButtonElement
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement

const TARGET_FRAME_TIME = 16.67 // 60 FPS 单帧时长
const PLACEHOLDER_TEXT = '暂无 long task 记录，开启卡顿任务后这里会显示事件...'

let longTaskDurations: number[] = []
let totalDroppedFrames = 0
let jankyMode = false
let jankTimerId: number | null = null

// 用 rAF 估算实时 FPS（PerformanceObserver 不直接给出 FPS）
let rafFrameCount = 0
let rafLastTime = performance.now()

function classifyFps(fps: number): string {
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'warn'
  return 'bad'
}

function measureFps(now: number): void {
  rafFrameCount++
  const delta = now - rafLastTime
  if (delta >= 500) {
    const fps = (rafFrameCount * 1000) / delta
    fpsValueEl.textContent = fps.toFixed(1)
    fpsValueEl.className = 'metric-value ' + classifyFps(fps)
    rafFrameCount = 0
    rafLastTime = now
  }
  requestAnimationFrame(measureFps)
}
requestAnimationFrame(measureFps)

// PerformanceObserver 监听 longtask
try {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    for (const entry of entries) {
      longTaskDurations.push(entry.duration)
      // 估算丢帧：超过一帧时长的部分视为丢帧
      const dropped = Math.max(
        0,
        Math.floor((entry.duration - TARGET_FRAME_TIME) / TARGET_FRAME_TIME),
      )
      totalDroppedFrames += dropped
      longTaskCountEl.textContent = String(longTaskDurations.length)
      droppedFramesEl.textContent = String(totalDroppedFrames)
      addJankItem(entry.duration, dropped)
      flashWarning()
    }
  })
  observer.observe({ entryTypes: ['longtask'] })
} catch (e) {
  console.warn('PerformanceObserver longtask 不被当前浏览器支持', e)
  addJankItem(0, 0, true)
}

function addJankItem(duration: number, dropped: number, unsupported = false): void {
  // 移除占位项
  if (
    jankListEl.children.length === 1 &&
    jankListEl.firstElementChild?.classList.contains('placeholder')
  ) {
    jankListEl.innerHTML = ''
  }
  const item = document.createElement('div')
  item.className = 'jank-item'
  if (unsupported) {
    item.textContent = '当前浏览器不支持 longtask 监听，建议使用 Chrome / Edge。'
    jankListEl.appendChild(item)
    return
  }
  const time = new Date().toLocaleTimeString()
  item.innerHTML = `<strong>[${time}]</strong> 耗时 ${duration.toFixed(1)}ms · 估算丢帧 ~${dropped} 帧`
  jankListEl.prepend(item)
  while (jankListEl.children.length > 10) {
    jankListEl.removeChild(jankListEl.lastChild!)
  }
}

let warningTimer: number | null = null
function flashWarning(): void {
  jankWarningEl.style.display = 'block'
  if (warningTimer !== null) window.clearTimeout(warningTimer)
  warningTimer = window.setTimeout(() => {
    jankWarningEl.style.display = 'none'
  }, 2000)
}

toggleJankBtn.addEventListener('click', () => {
  jankyMode = !jankyMode
  if (jankyMode) {
    toggleJankBtn.textContent = '停止卡顿任务'
    toggleJankBtn.classList.add('active')
    runJankyWork()
  } else {
    toggleJankBtn.textContent = '开启卡顿任务'
    toggleJankBtn.classList.remove('active')
    if (jankTimerId !== null) {
      window.clearTimeout(jankTimerId)
      jankTimerId = null
    }
  }
})

function runJankyWork(): void {
  if (!jankyMode) return
  // 阻塞主线程约 80ms，必然触发 longtask（>= 50ms）
  const start = performance.now()
  let sum = 0
  while (performance.now() - start < 80) {
    sum += Math.random()
  }
  // 引用 sum 防止死代码消除
  if (sum < -1) console.log(sum)
  jankTimerId = window.setTimeout(runJankyWork, 600)
}

resetBtn.addEventListener('click', () => {
  longTaskDurations = []
  totalDroppedFrames = 0
  longTaskCountEl.textContent = '0'
  droppedFramesEl.textContent = '0'
  jankListEl.innerHTML = `<div class="jank-item placeholder">${PLACEHOLDER_TEXT}</div>`
  jankWarningEl.style.display = 'none'
})
