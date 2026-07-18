# 优化网页的加载性能和渲染性能

> 本目录演示前端开发中常见的网页**加载性能**与**渲染性能**优化策略。
> 基于 React + TypeScript + Vite，共三个独立可运行的子项目。

## 目录结构

```
033. 优化网页的加载性能和渲染性能/
├── README.md                       # 本文件
├── 01-loading-optimization/        # 加载性能优化 (端口 5270)
├── 02-rendering-optimization/      # 渲染性能优化 (端口 5271)
└── 03-resource-optimization/       # 资源优化 (端口 5272)
```

## 快速开始

每个子项目都是独立工程，进入对应目录安装依赖并启动：

```bash
# 加载性能优化
cd 01-loading-optimization
npm install
npm run dev          # http://localhost:5270

# 渲染性能优化
cd ../02-rendering-optimization
npm install
npm run dev          # http://localhost:5271

# 资源优化
cd ../03-resource-optimization
npm install
npm run dev          # http://localhost:5272
```

## 优化策略总览

### 1. 加载性能优化 (`01-loading-optimization`)

聚焦于**缩短首屏可交互时间 (TTI)**，让用户更快看到可操作的页面。

| 策略                      | 说明                            | 关键 API                                        |
| ------------------------- | ------------------------------- | ----------------------------------------------- |
| 代码分割 (Code Splitting) | 按路由/组件拆分 chunk，按需加载 | `vite build.rollupOptions.manualChunks`         |
| 懒加载 (Lazy Load)        | 组件级别延迟加载                | `React.lazy` + `Suspense`                       |
| 预取 (Prefetch)           | 空闲时段下载未来资源            | `<link rel="prefetch">`、动态 `import()`        |
| 预加载 (Preload)          | 高优先级提前加载关键资源        | `<link rel="preload" as="font\|style\|script">` |
| Tree Shaking              | 静态分析剔除未使用代码          | ES Module + 生产构建                            |
| 第三方库拆分              | vendor 单独打包，长缓存友好     | `manualChunks`                                  |

**演示要点：**

- Bundle 体积对比柱状图（580KB → 120KB）
- `React.lazy` + `Suspense` 动态加载组件
- 鼠标 hover 触发 prefetch
- 优化前后加载瀑布对比

---

### 2. 渲染性能优化 (`02-rendering-optimization`)

聚焦于**减少不必要的重渲染**与**提升交互流畅度**。

| 策略                  | 说明                      | 关键 API                                         |
| --------------------- | ------------------------- | ------------------------------------------------ |
| React.memo            | 浅比较 props，跳过重渲染  | `memo(Component)`                                |
| useMemo               | 缓存昂贵计算结果          | `useMemo(fn, deps)`                              |
| useCallback           | 缓存函数引用，稳定 props  | `useCallback(fn, deps)`                          |
| 虚拟滚动              | 万条数据只渲染可见 ~10 条 | 手写 `IntersectionObserver` / `react-window`     |
| Debounce              | 高频事件降频              | 自实现 `debounce(fn, delay)`                     |
| Throttle              | 高频事件节流              | `throttle(fn, interval)`                         |
| requestAnimationFrame | 动画与刷新率同步          | `requestAnimationFrame` / `cancelAnimationFrame` |
| 合理使用 key          | 帮助 React diff 复用节点  | `key={uniqueId}`                                 |

**演示要点：**

- 同一父组件下，未优化子组件 vs `memo` 子组件的渲染次数对比
- 10000 行虚拟列表（DOM 节点 ~10 个）
- 搜索框 debounce 触发次数 vs 原始触发次数对比
- `setInterval` vs `requestAnimationFrame` 动画流畅度对比

---

### 3. 资源优化 (`03-resource-optimization`)

聚焦于**降低资源体积与传输耗时**。

| 策略            | 说明                               | 关键 API / 配置                              |
| --------------- | ---------------------------------- | -------------------------------------------- |
| 图片懒加载      | 可视区外不下载                     | `loading="lazy"` / `IntersectionObserver`    |
| 响应式图片      | 按视口宽度选择合适尺寸             | `srcset` + `sizes`                           |
| 现代图片格式    | WebP / AVIF 比 PNG/JPEG 小 30%-80% | `<picture>`                                  |
| CDN 加速        | 边缘节点就近分发                   | `<link rel="preconnect">` / `dns-prefetch`   |
| HTTP 强缓存     | 资源长期缓存                       | `Cache-Control: max-age=31536000, immutable` |
| HTTP 协商缓存   | 资源更新校验                       | `ETag` / `If-None-Match`                     |
| gzip / brotli   | 文本压缩，brotli 多省 15-25%       | nginx `gzip on` / `brotli on`                |
| HTTP/2 多路复用 | 单连接并行下载                     | 服务端开启 HTTP/2                            |

**演示要点：**

- IntersectionObserver 实现的图片懒加载网格
- `srcset` 响应式图片示例
- 优化前后资源加载瀑布图对比（3.2MB → 449KB）
- gzip / brotli / WebP / AVIF 压缩体积柱状图
- 各类资源 (JS/CSS/字体/API) 的缓存策略表

---

## 性能指标速查

| 指标 | 全称                      | 目标    | 关注点           |
| ---- | ------------------------- | ------- | ---------------- |
| FCP  | First Contentful Paint    | < 1.8s  | 首屏首次绘制     |
| LCP  | Largest Contentful Paint  | < 2.5s  | 最大内容元素绘制 |
| FID  | First Input Delay         | < 100ms | 首次交互响应     |
| INP  | Interaction to Next Paint | < 200ms | 交互到下一帧     |
| CLS  | Cumulative Layout Shift   | < 0.1   | 视觉稳定性       |
| TTI  | Time to Interactive       | < 3.8s  | 完全可交互时间   |
| TBT  | Total Blocking Time       | < 200ms | 主线程阻塞时长   |

## 常用排查工具

- **Chrome DevTools Performance / Network**：渲染与网络瀑布
- **Lighthouse**：综合性能评分与建议
- **Web Vitals Chrome 扩展**：实时核心指标
- **webpack-bundle-analyzer / vite-plugin-inspect**：包体积分析
- **React DevTools Profiler**：组件渲染耗时

## 优化原则

1. **先测量再优化**：基于 Lighthouse / Performance 数据，避免过早优化
2. **关注核心指标**：优先改善 LCP / INP / CLS 三项 Core Web Vitals
3. **分场景优化**：首屏 vs 路由切换 vs 交互流畅度各有侧重
4. **不过度优化**：memo / useMemo 也有成本，仅在昂贵计算/频繁渲染处使用
5. **持续监控**：通过 CI 集成性能预算 (performance budget) 防止回退

## 相关子项目

- [01-loading-optimization](./01-loading-optimization) - 加载性能：代码分割、懒加载、prefetch/preload
- [02-rendering-optimization](./02-rendering-optimization) - 渲染性能：memo/useMemo/useCallback、虚拟滚动、debounce、rAF
- [03-resource-optimization](./03-resource-optimization) - 资源优化：图片懒加载、srcset、CDN、缓存、压缩
