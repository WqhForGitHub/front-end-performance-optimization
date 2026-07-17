# Performance API 中哪些指标可以衡量首屏加载时间？

首屏加载时间没有单一的"金标准"指标，Performance API 提供了多组互补的指标，
分别从**网络/文档加载过程**和**像素渲染时刻**两个维度刻画首屏体验。本目录通过
**2 个纯 TypeScript + HTML Demo**（无 React、无 Vite）演示两类核心采集方式：

1. **Navigation Timing API** —— 拆解 DNS / TCP / TTFB / DOM 解析 / Load 全过程
2. **Paint Timing + LCP** —— 用 PerformanceObserver 实时监听 FP / FCP / LCP

每个 Demo 都是可独立运行的子项目，进入对应目录执行 `npm install && npm run type-check`
即可进行类型检查；用任意支持 TypeScript 的本地服务器（或编译后）打开 `index.html` 即可运行。

---

## 目录结构

```
021. Performance API 中指标可以衡量首屏加载时间/
├── README.md                          ← 本文件
├── 01-navigation-timing/              ← 方案一：Navigation Timing API 指标
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── env.d.ts                   ← 本地类型声明（DOM lib 已含 PerformanceObserver）
│       ├── main.ts                    ← 主入口：在 load 事件后采集并渲染
│       ├── navigation-metrics.ts      ← 拆解 Navigation Timing 各阶段 + 计算关键指标
│       ├── timeline-renderer.ts       ← 渲染瀑布时间线可视化
│       └── metrics-table.ts           ← 渲染指标卡片 + 阶段明细表 + 原始时间戳表
└── 02-paint-timing-lcp/               ← 方案二：Paint Timing + LCP 实时监控
    ├── package.json
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.ts                    ← 主入口：注册观察者 + 启动内容模拟
        ├── paint-observer.ts          ← PerformanceObserver 监听 paint（FP/FCP）
        ├── lcp-observer.ts            ← PerformanceObserver 监听 largest-contentful-paint
        ├── dashboard.ts               ← 实时仪表盘 + LCP 详情 + 指标定义表渲染
        ├── thresholds.ts              ← 指标定义、阈值、采集 API
        └── content-simulator.ts       ← 模拟内容渐进式加载以触发 LCP 更新
```

---

## 衡量首屏加载的核心指标一览

| 指标 | 全称 | 含义 | 良好 | 较差 | 采集 API |
| --- | --- | --- | --- | --- | --- |
| **FP** | First Paint | 浏览器首次渲染任何像素 | ≤ 1500ms | > 3000ms | `getEntriesByType('paint')` → `first-paint` |
| **FCP** | First Contentful Paint | 首次渲染文本/图像/SVG/Canvas | ≤ 1800ms | > 3000ms | `getEntriesByType('paint')` → `first-contentful-paint` |
| **LCP** | Largest Contentful Paint | 视口内最大内容元素完成渲染 | ≤ 2500ms | > 4000ms | `PerformanceObserver({type:'largest-contentful-paint'})` |
| **FMP** | First Meaningful Paint | 首次有意义绘制（**已废弃**） | ≤ 2000ms | > 4000ms | 已废弃，用 LCP 替代 |
| **TTI** | Time to Interactive | 可交互时间（主线程空闲） | ≤ 3800ms | > 7300ms | 需 Long Task + FCP 计算，无原生 API |
| **TTFB** | Time to First Byte | 首字节时间 | ≤ 800ms | > 1800ms | `navigationTiming.responseStart - requestStart` |
| **DOM Complete** | — | DOM 解析 + 同步资源加载完成 | ≤ 3000ms | > 5000ms | `navigationTiming.domComplete` |
| **Load** | — | load 事件结束 | ≤ 3000ms | > 5000ms | `navigationTiming.loadEventEnd - startTime` |

> **现代实践**：Core Web Vitals 已把 **LCP** 作为首屏加载的官方指标（替代已废弃的 FMP），
> 辅以 FCP 反映首次内容出现、TTFB 反映服务端响应。

---

## 方案一：Navigation Timing API（`01-navigation-timing`）

### 核心思想

`performance.getEntriesByType('navigation')` 返回 `PerformanceNavigationTiming` 对象，
记录了从 `startTime` 到 `loadEventEnd` 的完整时间戳序列。通过相邻时间戳相减即可得到
每个阶段的耗时：

```
startTime
  ↓
fetchStart ─────────── (redirect)
  ↓
domainLookupStart ──── domainLookupEnd     ← DNS
  ↓
connectStart ───────── connectEnd          ← TCP
  ↓ (secureConnectionStart)                ← SSL
requestStart ───────── responseStart        ← TTFB
  ↓
responseEnd                                 ← 响应下载
  ↓
domInteractive                              ← DOM 解析完成
  ↓
domContentLoadedEventEnd                    ← DCL
  ↓
domComplete                                 ← DOM Complete
  ↓
loadEventEnd                                ← Load
```

### 关键代码

```ts
// src/navigation-metrics.ts
export function collectNavigationMetrics(nav: PerformanceNavigationTiming) {
  const phases = [
    {
      label: 'DNS',
      start: nav.domainLookupStart,
      end: nav.domainLookupEnd,
      duration: nav.domainLookupEnd - nav.domainLookupStart,
      color: '#4caf50',
    },
    {
      label: 'TCP',
      start: nav.connectStart,
      end: nav.connectEnd,
      duration: nav.connectEnd - nav.connectStart,
      color: '#2196f3',
    },
    {
      label: 'TTFB',
      start: nav.requestStart,
      end: nav.responseStart,
      duration: nav.responseStart - nav.requestStart,
      color: '#ff9800',
    },
    {
      label: 'DOM Parsing',
      start: nav.responseEnd,
      end: nav.domInteractive,
      duration: nav.domInteractive - nav.responseEnd,
      color: '#9c27b0',
    },
    // ... 其余阶段
  ]

  // 与 Paint Timing 互补，取 FP / FCP
  const paint = performance.getEntriesByType('paint')
  const fp = paint.find((e) => e.name === 'first-paint')?.startTime ?? 0
  const fcp = paint.find((e) => e.name === 'first-contentful-paint')?.startTime ?? 0

  return { phases, keyMetrics: [{ key: 'fcp', value: fcp }, /* ... */] }
}
```

```ts
// src/main.ts
window.addEventListener('load', () => {
  // loadEventEnd 在 load 事件同步回调里可能仍为 0，需延迟一帧
  setTimeout(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const { phases, keyMetrics, rawEntry, totalDuration } = collectNavigationMetrics(nav)
    renderKeyMetricsCards(keyMetrics)
    renderTimeline(phases, totalDuration)
    renderMetricsTable(phases)
    renderRawEntry(rawEntry)
  }, 0)
})
```

### Demo 看点

- **关键指标卡片**：FP / FCP / TTFB / TTI / DOM Complete / Load，按 web.dev 阈值自动评级（绿/橙/红）
- **瀑布时间线**：各阶段在时间轴上的位置与占比，鼠标悬停查看详情
- **阶段明细表**：每个阶段的起止时间戳与说明
- **原始时间戳表**：`PerformanceNavigationTiming` 全部字段（含 `transferSize` / `decodedBodySize`）

---

## 方案二：Paint Timing + LCP 实时监控（`02-paint-timing-lcp`）

### 核心思想

与 Navigation Timing 的"事后一次性读取"不同，**PerformanceObserver** 可以**实时订阅**
性能条目，特别适合 FP / FCP / LCP 这类渲染时刻指标：

- `type: 'paint'` → 派发 `first-paint` 与 `first-contentful-paint` 两条条目
- `type: 'largest-contentful-paint'` → 每当视口内出现更大的内容元素时**重复派发**，
  最终值是用户首次交互前的最后一条

```ts
// src/paint-observer.ts
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-paint') updateMetric('fp', entry.startTime)
    if (entry.name === 'first-contentful-paint') updateMetric('fcp', entry.startTime)
  }
})
observer.observe({ type: 'paint', buffered: true }) // buffered: 补发已发生的事件
```

```ts
// src/lcp-observer.ts
const lcpObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const lcp = entry as LargestContentfulPaint
    updateMetric('lcp', lcp.startTime)
    // lcp.element / lcp.size / lcp.url 可定位是哪个元素成为 LCP
  }
})
lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

// 用户首次交互后 LCP 不再更新，应在此时"冻结"
;['pointerdown', 'keydown', 'scroll'].forEach((evt) =>
  window.addEventListener(evt, () => lcpObserver.disconnect(), { once: true }),
)
```

### Demo 看点

- **实时仪表盘**：FP / FCP / LCP 三张卡片，数值在收到条目时实时刷新，并按阈值变色
- **阈值刻度条**：白色标记在绿/橙/红区间上的位置，直观看到当前值落在哪一档
- **LCP 元素详情**：显示当前 LCP 元素的 tag/id/class、面积、渲染时间、更新次数
- **渐进式内容模拟**：标题 → 段落 → 主图 → 大卡片分阶段出现，可观察到 LCP 多次更新
- **用户交互冻结**：点击/滚动后 LCP 标记为"已冻结"，与浏览器实际行为一致
- **指标定义表**：FP / FCP / LCP / FMP / TTI / TTFB 的含义、阈值、采集 API 与状态（推荐/已废弃/补充）

### FMP 说明

**First Meaningful Paint（首次有意义绘制）**曾是首屏核心指标，但其定义依赖布局突变 +
文本权重等启发式算法，难以稳定测量，Chrome 已于 2020 年废弃。官方推荐用 **LCP** 替代：
LCP 基于"最大内容元素渲染时间"，定义清晰、可稳定测量、与用户感知高度一致。

---

## 运行方式

每个子项目独立运行，**无 Vite / 无 React**，仅依赖 TypeScript 做类型检查。

### 类型检查（无需浏览器）

```bash
cd 01-navigation-timing   # 或 02-paint-timing-lcp

# 安装 typescript 依赖
npm install

# 类型检查
npm run type-check
# 等价于 tsc --noEmit
```

### 在浏览器中运行

由于浏览器无法直接执行 `.ts` 文件，`index.html` 中的 `<script type="module" src="src/main.ts">`
需要经过一次 TypeScript 编译，或借助支持 TS 的开发服务器。任选其一：

**方式 A：用 `tsc` 编译后直接打开**

```bash
# 在子目录下编译（需要把 tsconfig 的 noEmit 改为 false 并设置 outDir，或用下面命令）
npx tsc src/main.ts --target ES2020 --module ESNext --moduleResolution bundler --lib ES2020,DOM,DOM.Iterable --strict --skipLibCheck
# 生成 main.js 后，把 index.html 中的 src/main.ts 改为 src/main.js 即可双击打开
```

**方式 B：用支持 TS 的轻量开发服务器（推荐）**

```bash
# 方式 B1：Vite（仅作 dev server，不引入框架）
npx vite

# 方式 B2：esbuild serve
npx esbuild src/main.ts --bundle --served
```

> Demo 主要面向"代码可读性 + 类型正确性"，类型检查通过即视为 Demo 完整。

---

## 类型检查说明

每个子项目的 `src/env.d.ts` 极简（仅一句 `export {}`），因为 `PerformanceObserver`、
`PerformanceNavigationTiming`、`LargestContentfulPaint` 等类型已包含在 TypeScript 的
`DOM` lib 中，只要 `tsconfig.json` 的 `lib` 包含 `"DOM"` 即可。

`tsconfig.json` 关键配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "types": []
  },
  "include": ["src"]
}
```

直接在任一子目录执行：

```bash
npx tsc --noEmit
# 或
npm run type-check
```

均可通过，**无需 `npm install`**（因为类型全部来自 TS 内置 DOM lib）。

---

## 两种方案对比

| 维度 | 方案一：Navigation Timing | 方案二：Paint Timing + LCP |
| --- | --- | --- |
| 采集方式 | 一次性读取 `getEntriesByType('navigation')` | `PerformanceObserver` 实时订阅 |
| 关注层面 | 网络/文档加载**过程**（DNS/TCP/DOM/Load） | 像素渲染**时刻**（FP/FCP/LCP） |
| 是否含交互后冻结 | 否（load 事件后即完整） | 是（LCP 在用户首次交互后冻结） |
| 是否反映用户感知 | 间接（DOM Complete / Load） | 直接（FCP / LCP） |
| 典型用途 | 性能剖析、定位瓶颈阶段 | 真实用户体验监控、Core Web Vitals 上报 |
| 推荐场景 | 性能优化排障 | 线上 RUM 监控 + 告警 |

两种方案**互补**：Navigation Timing 帮你找到"为什么慢"，Paint Timing + LCP 告诉你
"用户感受到多慢"。生产实践中通常把 LCP 作为首屏加载的核心 KPI，并用 Navigation Timing
各阶段做归因分析。

---

## 选型建议

| 场景 | 推荐指标 | 推荐方案 |
| --- | --- | --- |
| 线上 RUM 监控 + Core Web Vitals 上报 | LCP + FCP | 方案二 |
| 性能瓶颈排障（不知道慢在哪） | TTFB + 各阶段耗时 | 方案一 |
| SSR / SSG 效果验证 | FCP + LCP | 方案二 |
| CDN / 服务端响应优化 | TTFB | 方案一 |
| 第三方脚本影响评估 | DOM Complete + Load | 方案一 |
| 综合首屏体验评估 | LCP + FCP + TTI | 方案二 + Long Task 监控 |
