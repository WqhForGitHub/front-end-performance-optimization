# 检测 CSS 动画的 FPS 值

本目录包含三种检测页面 FPS（每秒帧数）与动画流畅度的方案，全部使用**纯 TypeScript + DOM 操作**实现，无任何框架依赖（无 React、无 Vite）。

## 为什么需要检测 FPS？

CSS 动画理论上由浏览器合成器线程处理，理论上可保持 60 FPS。但当主线程被 JavaScript 阻塞、发生布局抖动或合成层数量过多时，仍然会丢帧。实时监测 FPS 可以：

- 量化动画流畅度（60 FPS / 120 FPS 目标）
- 定位卡顿（jank）发生的时间点与原因
- 评估性能优化前后效果

## 三种方案概览

| 方案                           | 入口目录                   | 原理                                                  | 浏览器支持                 |
| ------------------------------ | -------------------------- | ----------------------------------------------------- | -------------------------- |
| requestAnimationFrame          | `01-requestanimationframe` | 测量两次 rAF 回调的时间差 `delta`，FPS = 1000 / delta | 全平台                     |
| PerformanceObserver (longtask) | `02-performance-observer`  | 监听主线程超过 50ms 的任务，估算丢帧数                | Chrome / Edge              |
| Frame Timing API               | `03-frame-timing-api`      | 读取 `performance.getEntriesByType('frame')` 每帧细节 | 实验性（多数浏览器未实现） |

---

## 方案一：requestAnimationFrame

最经典、兼容性最好的方案。浏览器在每次准备重绘前调用一次 `requestAnimationFrame` 回调，记录相邻两次回调的时间差即可得到瞬时帧时长，从而换算 FPS。

### 核心代码

```ts
let lastTime = 0
let running = false

function tick(now: number): void {
  if (!running) return
  if (lastTime === 0) {
    lastTime = now
    requestAnimationFrame(tick)
    return
  }
  const delta = now - lastTime
  lastTime = now
  const fps = 1000 / delta // 瞬时 FPS
  // 记录历史、绘制曲线、更新 min/max/avg 统计...
  requestAnimationFrame(tick)
}

document.getElementById('start')!.addEventListener('click', () => {
  running = true
  lastTime = 0
  requestAnimationFrame(tick)
})
```

### 演示内容

- 实时 FPS 计数器（当前 / 最小 / 最大 / 平均）
- FPS 历史曲线（Canvas 绘制，带 60 FPS 基准线）
- CSS 动画舞台（弹跳球 + 旋转加载器）
- 开始 / 停止按钮

### 优点

- 兼容所有现代浏览器
- 实现简单，可得到逐帧瞬时 FPS
- 可绘制 FPS 历史曲线，直观可视化

### 缺点

- 只能得到"渲染帧"间隔，无法区分主线程 / 合成器耗时
- 后台标签页时 rAF 会被节流到 ~1Hz，需过滤异常 delta

---

## 方案二：PerformanceObserver (longtask)

`PerformanceObserver` 可以订阅 `longtask` 性能条目 —— 任何在主线程上执行超过 50ms 的任务都会被记录。每个 long task 期间会丢失若干帧，借此估算丢帧数。注意：longtask 不直接给出 FPS，需要配合 rAF 估算实时 FPS。

### 核心代码

```ts
const TARGET_FRAME_TIME = 16.67 // 60 FPS 单帧时长

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 超过一帧时长的部分视为丢帧
    const dropped = Math.max(
      0,
      Math.floor((entry.duration - TARGET_FRAME_TIME) / TARGET_FRAME_TIME),
    )
    console.log(`Long task: ${entry.duration}ms, dropped ~${dropped} frames`)
  }
})
observer.observe({ entryTypes: ['longtask'] })
```

### 演示内容

- 仪表盘：实时 FPS（rAF 估算）、Long Task 数量、估算丢帧总数
- 卡顿告警横幅（检测到 long task 时闪烁）
- 可触发的"卡顿任务"按钮：在主线程同步执行 ~80ms 繁重计算，制造 longtask
- 最近卡顿事件列表

### 优点

- 直接定位卡顿源（可结合 `longTask.attribution` 进一步归因）
- 浏览器原生 API，几乎零开销
- 非常适合线上 RUM（Real User Monitoring）上报

### 缺点

- 不能直接得到 FPS 值，只能反映"卡顿事件"
- `longtask` 仅 Chrome / Edge 系浏览器支持
- 短卡顿（< 50ms）无法被捕获

---

## 方案三：Frame Timing API

Frame Timing API 的设计目标是提供每一帧的详细时间：`duration`、`mainThreadTime`、`compositorTime`、`rendererMainTime` 等。通过 `performance.getEntriesByType('frame')` 读取。这是信息最完整的方案，但遗憾的是目前主流浏览器均未真正实现。

### 核心代码

```ts
interface FrameTimingLike extends PerformanceEntry {
  duration: number
  mainThreadTime?: number
  compositorTime?: number
}

const entries = performance.getEntriesByType('frame') as FrameTimingLike[]
if (entries.length > 0) {
  const last = entries[entries.length - 1]
  console.log({
    duration: last.duration,
    mainThreadTime: last.mainThreadTime,
    compositorTime: last.compositorTime,
  })
  const fps = 1000 / last.duration
}
```

### 演示内容

- 帧时长、主线程时间、合成器时间、累计帧数四项指标
- 浏览器支持情况横幅（支持时显示绿色，不支持时显示红色并自动回退）
- **三种方式同屏对比表**：requestAnimationFrame、PerformanceObserver、Frame Timing API 并行运行
- 当 Frame Timing API 不可用时，使用 rAF 平均 delta 回退估算（读数带 `*` 标记）

### 优点

- 信息最完整：主线程时间、合成时间、渲染时间分开
- 理论上能精确刻画每一帧的耗时构成

### 缺点

- **目前主流浏览器均未实现**（规范停滞，仅有早期实验）
- 需要做支持检测 + rAF 回退

---

## 运行方式

每个子目录都是独立的 TypeScript 项目。由于 `index.html` 使用 `<script type="module" src="src/main.ts">`，浏览器无法直接通过 `file://` 加载 ES 模块，需要通过本地静态服务器运行（TypeScript 源码由现代浏览器原生加载，无需打包）。

> 注意：直接用浏览器打开 `index.html` 会因 CORS 限制而失败，必须使用本地服务器。

```bash
# 进入任一子目录
cd "01-requestanimationframe"

# 安装 TypeScript（仅用于类型检查，不打包）
npm install

# 类型检查
npm run type-check

# 用任意静态服务器启动，例如：
npx serve .
# 或
python -m http.server 8080
```

然后访问 `http://localhost:8080/` 即可。

### 目录结构

```
030. 检测 CSS 动画的 FPS 值/
├── README.md
├── 01-requestanimationframe/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       └── main.ts
├── 02-performance-observer/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       └── main.ts
└── 03-frame-timing-api/
    ├── package.json
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── env.d.ts
        └── main.ts
```

---

## 方案选型建议

| 场景                              | 推荐方案                                                |
| --------------------------------- | ------------------------------------------------------- |
| 实时可视化 FPS 仪表盘（给用户看） | 方案一（rAF）                                           |
| 线上卡顿监控 / RUM 上报           | 方案二（longtask）                                      |
| 深入分析每帧耗时构成              | 方案三（Frame Timing，目前仅实验性）                    |
| 生产实践                          | 方案一 + 方案二组合：前者展示实时 FPS，后者上报卡顿事件 |

实际工程中，最常用的组合是 **requestAnimationFrame 做实时展示 + PerformanceObserver (longtask) 做卡顿上报**。Frame Timing API 虽然信息最全，但因其浏览器支持缺失，目前不具备生产可用性，可作为面向未来的预留方案。
