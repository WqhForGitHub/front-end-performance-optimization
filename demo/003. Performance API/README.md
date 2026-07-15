# Performance API 中衡量首屏加载时间的指标

## 问题背景

首屏加载时间（First Screen / First Paint）是用户体验的核心指标。浏览器提供了 Performance API 来精确测量页面加载各阶段的耗时，无需引入任何第三方库。

## 核心 API 及指标

### 1. Navigation Timing API

通过 `performance.getEntriesByType('navigation')` 获取，包含页面加载的完整时间线：

| 阶段      | 起止属性                                                  | 含义                   |
| --------- | --------------------------------------------------------- | ---------------------- |
| DNS 查询  | `domainLookupStart` → `domainLookupEnd`                   | 域名解析耗时           |
| TCP 连接  | `connectStart` → `connectEnd`                             | TCP 握手（含 SSL）耗时 |
| SSL 握手  | `secureConnectionStart` → `connectEnd`                    | HTTPS 安全连接耗时     |
| 请求响应  | `requestStart` → `responseStart`                          | TTFB（首字节时间）     |
| 响应下载  | `responseStart` → `responseEnd`                           | 响应内容下载耗时       |
| DOM 解析  | `domLoading` → `domInteractive`                           | HTML 解析为 DOM 树     |
| DCL 事件  | `domContentLoadedEventStart` → `domContentLoadedEventEnd` | DOMContentLoaded 回调  |
| 资源加载  | `domInteractive` → `domComplete`                          | 同步资源加载           |
| load 事件 | `loadEventStart` → `loadEventEnd`                         | onload 回调执行        |

**衡量首屏的关键派生指标：**

- **TTFB** = `responseStart - navigationStart` —— 首字节时间
- **首屏时间（估算）** = `domInteractive - navigationStart` —— DOM 解析完成，页面可交互
- **DOMContentLoaded** = `domContentLoadedEventEnd - navigationStart` —— DOM 就绪
- **页面完全加载** = `loadEventEnd - navigationStart` —— 所有资源加载完成

### 2. Paint Timing API

通过 `performance.getEntriesByType('paint')` 获取：

| 指标                             | 说明                               | 评级标准                            |
| -------------------------------- | ---------------------------------- | ----------------------------------- |
| **FP** (First Paint)             | 浏览器首次绘制任何内容（如背景色） | -                                   |
| **FCP** (First Contentful Paint) | 首次绘制 DOM 内容（文本、图片等）  | < 1.8s 良好 / < 3s 需改进 / > 3s 差 |

FCP 是衡量首屏加载体验最直接的指标之一。

### 3. Largest Contentful Paint (LCP)

通过 `PerformanceObserver` 监听 `largest-contentful-paint` 事件：

| 指标    | 说明                             | 评级标准                            |
| ------- | -------------------------------- | ----------------------------------- |
| **LCP** | 页面最大内容块首次完全渲染的时间 | < 2.5s 良好 / < 4s 需改进 / > 4s 差 |

LCP 是 Google Core Web Vitals 的三个核心指标之一，比 FCP 更准确地反映用户感知的"首屏加载完成"。

### 4. Resource Timing API

通过 `performance.getEntriesByType('resource')` 获取每个资源（JS、CSS、图片等）的详细加载计时，包含：

- `initiatorType` - 资源类型
- `transferSize` - 传输大小（压缩后）
- `decodedBodySize` - 解码后大小
- `duration` - 总耗时

### 5. User Timing API

通过 `performance.mark()` 和 `performance.measure()` 进行自定义性能标记：

```ts
performance.mark('myTask-start')
// ... 执行任务 ...
performance.mark('myTask-end')
performance.measure('myTask', 'myTask-start', 'myTask-end')
```

适合在业务代码中标记关键节点，精确测量各业务阶段耗时。

## 项目结构

```
003. Performance API/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.ts                          # 入口 - 仪表盘渲染逻辑
    ├── env.d.ts
    ├── styles.css                       # 样式
    └── performance/
        ├── types.ts                     # 类型定义
        ├── navigationTiming.ts          # Navigation Timing API
        ├── paintTiming.ts               # Paint Timing API (FP/FCP)
        ├── lcp.ts                       # LCP (Largest Contentful Paint)
        ├── resourceTiming.ts            # Resource Timing API
        └── userTiming.ts                # User Timing API (mark/measure)
```

## 启动方式

```bash
cd "003. Performance API"
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5190`，页面将展示：

1. **关键性能指标卡片** - TTFB、DNS、TCP、DOM 解析、DCL、首屏时间、完全加载等指标，带颜色评级
2. **加载时间线** - 各阶段耗时的可视化条形图
3. **FP / FCP** - 首次绘制和首次内容绘制时间
4. **LCP** - 最大内容绘制时间及对应元素信息
5. **资源加载统计** - 按类型分组的资源数量、耗时和大小
6. **User Timing 演示** - 自定义标记和测量示例

点击「刷新数据」按钮可重新采集所有指标。

## 指标选型建议

| 场景               | 推荐指标                           | 理由                                   |
| ------------------ | ---------------------------------- | -------------------------------------- |
| 衡量首屏加载体验   | **FCP** + **LCP**                  | 直接反映用户看到页面内容的时间         |
| 衡量页面可交互时间 | `domInteractive - navigationStart` | DOM 解析完成，可以响应用户操作         |
| 衡量页面完全加载   | `loadEventEnd - navigationStart`   | 所有资源加载完成                       |
| 诊断加载瓶颈       | Navigation Timing 时间线           | 定位是 DNS/TCP/TTFB/DOM 解析哪个阶段慢 |
| 监控业务关键节点   | User Timing (mark/measure)         | 自定义标记，测量业务逻辑耗时           |
| 监控资源加载性能   | Resource Timing                    | 分析单个资源的加载耗时和大小           |
