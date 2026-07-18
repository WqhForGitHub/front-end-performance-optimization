// FPS 测量：requestAnimationFrame 方式
// 通过记录两次 rAF 回调的时间差（delta），计算瞬时 FPS = 1000 / delta
// 这是兼容性最好、最经典的 FPS 测量方案

const currentFpsEl = document.getElementById('current-fps') as HTMLSpanElement
const minFpsEl = document.getElementById('min-fps') as HTMLSpanElement
const maxFpsEl = document.getElementById('max-fps') as HTMLSpanElement
const avgFpsEl = document.getElementById('avg-fps') as HTMLSpanElement
const fpsGraph = document.getElementById('fps-graph') as HTMLCanvasElement
const startBtn = document.getElementById('start-btn') as HTMLButtonElement
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement

const MAX_HISTORY = 240
let running = false
let rafId: number | null = null
let lastTime = 0
let fpsHistory: number[] = []
let sessionFps: number[] = []

const ctx = fpsGraph.getContext('2d')

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1
  // 设置物理像素尺寸，随后通过 scale 让绘图坐标基于 CSS 像素
  fpsGraph.width = fpsGraph.clientWidth * dpr
  fpsGraph.height = fpsGraph.clientHeight * dpr
  if (ctx) ctx.scale(dpr, dpr)
}

function classifyFps(fps: number): string {
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'warn'
  return 'bad'
}

function drawGraph(): void {
  if (!ctx) return
  const w = fpsGraph.clientWidth
  const h = fpsGraph.clientHeight
  ctx.clearRect(0, 0, w, h)

  // 网格线
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = (i / 4) * h
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  // 60 FPS 参考线
  const y60 = h - (60 / 120) * h
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)'
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(0, y60)
  ctx.lineTo(w, y60)
  ctx.stroke()
  ctx.setLineDash([])

  // FPS 曲线
  if (fpsHistory.length < 2) return
  ctx.strokeStyle = '#ffeb3b'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < fpsHistory.length; i++) {
    const x = (i / (MAX_HISTORY - 1)) * w
    const y = h - Math.min(fpsHistory[i] / 120, 1) * h
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 曲线下方填充
  const lastX = ((fpsHistory.length - 1) / (MAX_HISTORY - 1)) * w
  ctx.lineTo(lastX, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255, 235, 59, 0.15)'
  ctx.fill()
}

function updateMetrics(fps: number): void {
  sessionFps.push(fps)
  currentFpsEl.textContent = fps.toFixed(1)
  currentFpsEl.className = 'metric-value ' + classifyFps(fps)

  let min = Infinity
  let max = -Infinity
  let sum = 0
  for (const f of sessionFps) {
    if (f < min) min = f
    if (f > max) max = f
    sum += f
  }
  minFpsEl.textContent = min.toFixed(1)
  maxFpsEl.textContent = max.toFixed(1)
  avgFpsEl.textContent = (sum / sessionFps.length).toFixed(1)
}

function tick(now: number): void {
  if (!running) return
  if (lastTime === 0) {
    lastTime = now
    rafId = requestAnimationFrame(tick)
    return
  }
  const delta = now - lastTime
  lastTime = now
  // 过滤异常 delta（切后台、首次回调等）
  if (delta > 0 && delta < 1000) {
    const fps = 1000 / delta
    fpsHistory.push(fps)
    if (fpsHistory.length > MAX_HISTORY) fpsHistory.shift()
    updateMetrics(fps)
    drawGraph()
  }
  rafId = requestAnimationFrame(tick)
}

startBtn.addEventListener('click', () => {
  if (running) return
  running = true
  lastTime = 0
  fpsHistory = []
  sessionFps = []
  currentFpsEl.textContent = '0.0'
  minFpsEl.textContent = '0.0'
  maxFpsEl.textContent = '0.0'
  avgFpsEl.textContent = '0.0'
  startBtn.disabled = true
  stopBtn.disabled = false
  rafId = requestAnimationFrame(tick)
})

stopBtn.addEventListener('click', () => {
  running = false
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  startBtn.disabled = false
  stopBtn.disabled = true
})

window.addEventListener('resize', () => {
  resizeCanvas()
  drawGraph()
})

resizeCanvas()
drawGraph()
