# 019. 前端网站性能优化的关键点

本目录通过三个独立的 TypeScript + Vite + React 演示项目，系统地展示前端网站性能优化的关键点。
每个项目聚焦一个核心主题，并提供可交互的可视化对比。

## 项目结构

```
019. 前端网站性能优化的关键点/
├── 01-core-web-vitals/        # Core Web Vitals 实时监控（端口 5237）
├── 02-resource-optimization/  # 资源加载优化策略（端口 5238）
└── 03-rendering-optimization/ # 渲染优化策略（端口 5239）
```

## 1. Core Web Vitals 监控（`01-core-web-vitals`）

使用浏览器原生 **PerformanceObserver API** 实时采集三大核心指标，并以彩色徽章展示评级（良好 / 需改进 / 较差）。

- **LCP**（Largest Contentful Paint，最大内容绘制）：衡量加载性能
  - 良好 ≤ 2.5s，需改进 ≤ 4.0s，较差 > 4.0s
- **CLS**（Cumulative Layout Shift，累计布局偏移）：衡量视觉稳定性
  - 良好 ≤ 0.1，需改进 ≤ 0.25，较差 > 0.25
- **INP**（Interaction to Next Paint，交互到下一次绘制）：衡量交互响应速度（2024 年 3 月起取代 FID）
  - 良好 ≤ 200ms，需改进 ≤ 500ms，较差 > 500ms

演示要点：

- 实时显示指标数值与彩色评级徽章
- 提供 Google 官方阈值对照表
- 提供交互触发器：点击「主线程阻塞」按钮会让 INP 变差；点击「注入布局偏移」按钮会让 CLS 上升
- 采集历史记录列表，按时间倒序展示

关键文件：

- `src/hooks/useWebVitals.ts` - PerformanceObserver 采集逻辑
- `src/components/MetricCard.tsx` - 指标卡片与彩色徽章
- `src/components/ThresholdTable.tsx` - 阈值对照表

## 2. 资源加载优化（`02-resource-optimization`）

演示四种 **Resource Hints**（资源提示）技术及图片懒加载，提供交互式技术卡片和加载时间线可视化。

| 技术       | rel 值         | 用途                                         |
| ---------- | -------------- | -------------------------------------------- |
| 预加载     | `preload`      | 提前加载当前页关键资源（字体、CSS、关键 JS） |
| 预获取     | `prefetch`     | 浏览器空闲时预取下一页可能用到的资源         |
| DNS 预解析 | `dns-prefetch` | 提前完成第三方域名的 DNS 解析                |
| 预连接     | `preconnect`   | 提前完成 DNS + TCP + TLS 握手                |

演示要点：

- 每个技术卡片可一键将真实 `<link>` 标签注入到 `document.head`
- 注入后在下方面板展示已注入的 link 标签列表（带时间戳）
- 资源加载时间线对比：preconnect 优化前后的连接阶段、preload 关键字体优化前后的渲染阻塞
- 图片懒加载对比：eager 立即加载 vs `loading="lazy"` 按需加载，用 IntersectionObserver 统计已加载数

关键文件：

- `src/data/techniques.ts` - 技术定义与时间线数据
- `src/components/TechniqueCard.tsx` - 可注入 link 标签的技术卡片
- `src/components/TimelineVisualization.tsx` - 加载时间线可视化
- `src/components/LazyImageGallery.tsx` - 图片懒加载对比

## 3. 渲染优化（`03-rendering-optimization`）

演示三种渲染层面的优化手段，每种都提供「优化前 vs 优化后」的量化对比。

### 3.1 防抖（Debounce）

在搜索框中快速输入时，对比「立即过滤」与「防抖过滤（300ms）」。

- 立即过滤：每次按键都对 5000 条数据执行过滤
- 防抖过滤：仅在用户停止输入 300ms 后才过滤
- 量化指标：按键次数 vs 过滤执行次数

### 3.2 requestAnimationFrame

让三个小球同时左右往返移动，对比三种驱动方式：

- 方式1：`setState + setInterval(10ms)` - 高频 setState 触发大量重渲染
- 方式2：直接操作 DOM + `setInterval(16ms)` - 跳过 React 但可能与刷新不同步
- 方式3：直接操作 DOM + `requestAnimationFrame`（推荐）- 与屏幕刷新同步
- 量化指标：FPS、总帧数、丢帧数（>20ms）

### 3.3 虚拟滚动

对 10000 行长列表进行渲染对比：

- 全量渲染：一次性创建 10000 个 DOM 节点，切换时明显卡顿
- 虚拟滚动：只渲染可视区域内的少量节点（~16 个），滚动流畅
- 滚动事件使用 requestAnimationFrame 节流
- 量化指标：DOM 节点数、切换渲染耗时

关键文件：

- `src/hooks/useDebounce.ts` - 防抖 Hook
- `src/hooks/useRafThrottle.ts` - requestAnimationFrame 节流 Hook
- `src/components/DebounceDemo.tsx` - 防抖输入对比
- `src/components/AnimationDemo.tsx` - 动画驱动方式对比
- `src/components/VirtualScrollDemo.tsx` - 虚拟滚动对比

## 运行方式

进入任一子目录后执行：

```bash
# 安装依赖（可选，env.d.ts 已提供 fallback 类型声明）
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build
```

各项目开发服务器端口：

- `01-core-web-vitals`: http://localhost:5237
- `02-resource-optimization`: http://localhost:5238
- `03-rendering-optimization`: http://localhost:5239

## 技术栈

- TypeScript 5.5
- Vite 5.3
- React 18.3

## 性能优化关键点总结

1. **监测先行**：用 PerformanceObserver 持续采集 Core Web Vitals，建立性能基线
2. **关键路径优化**：用 preload 加载关键资源，用 preconnect 提前建立连接
3. **按需加载**：用 prefetch 预取下一页资源，用 `loading="lazy"` 懒加载图片
4. **减少渲染**：用防抖/节流控制高频事件，用 requestAnimationFrame 驱动动画
5. **DOM 优化**：长列表用虚拟滚动，避免一次性创建海量节点
6. **视觉稳定**：为图片/广告位预留尺寸，降低 CLS
7. **交互响应**：避免长任务阻塞主线程，保持 INP 在良好区间
