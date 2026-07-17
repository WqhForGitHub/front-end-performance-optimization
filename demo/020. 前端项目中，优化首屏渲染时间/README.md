# 前端项目中，如何优化首屏渲染时间？

首屏渲染时间（FCP / LCP）是用户体验最直接的指标之一。本目录通过 **3 个独立的 Vite + React + TypeScript Demo**，
演示三种最常见且行之有效的优化方案：关键 CSS 内联、骨架屏 + 代码分割、SSR / 预渲染。

每个 Demo 都是可独立运行的子项目，无需安装根目录依赖，进入对应目录执行 `npm install && npm run dev` 即可。

---

## 目录结构

```
020. 前端项目中，优化首屏渲染时间/
├── README.md                      ← 本文件
├── 01-critical-css/               ← 方案一：关键 CSS 内联 + 异步加载（端口 5240）
├── 02-skeleton-screen/            ← 方案二：骨架屏 + 代码分割（端口 5241）
└── 03-ssr-prerender/              ← 方案三：SSR / 预渲染（端口 5242）
```

每个子目录都是标准的 Vite + React + TS 工程：

```
01-critical-css/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── env.d.ts                   ← 本地 fallback 类型声明（无需 node_modules 也能 tsc --noEmit）
    ├── main.tsx
    ├── App.tsx
    └── components/                ← 各方案专属组件
```

---

## 三种方案概览

### 方案一：关键 CSS 内联 + 异步加载（`01-critical-css`，端口 5240）

**核心思想**：把首屏可见区域（above-the-fold）所需的最小 CSS 直接内联到 HTML `<head>` 的 `<style>` 标签中，
浏览器解析 HTML 后无需等待外部 CSS 请求即可触发首次内容绘制（FCP）；其余非关键 CSS 通过 `rel="preload"` + `onload` 异步加载。

**Demo 看点**：
- 一键切换「关键 CSS 内联」/「外部全量 CSS」两种模式，直观对比 FCP / LCP 时间线
- 实时演示首屏可见性：内联模式下 200ms 触发 FCP，外部 CSS 模式下要等到 520ms
- 加载时间线可视化（HTML 下载、CSS 阻塞、JS 执行、FCP/LCP 标记点）
- 代码示例：`vite-plugin-critical` 配置、`index.html` 手动内联 + loadCSS pattern、`critical` CLI 用法

**预期收益**：FCP 从 500ms+ 降到 200ms 量级。

---

### 方案二：骨架屏 + 代码分割（`02-skeleton-screen`，端口 5241）

**核心思想**：
1. 用 `React.lazy` + `Suspense` 把不同模块拆成独立 chunk，缩小首屏 JS 体积
2. 在 chunk 下载与数据请求期间渲染与真实内容结构一致的骨架屏，避免空白闪烁
3. 骨架屏保持布局稳定（CLS 友好），让用户感知到「正在加载」而非「卡死」

**Demo 看点**：
- 模拟网络切换（4G 快速 / 3G 慢速），观察 chunk 下载与数据请求耗时
- 一键切换「骨架屏」/「空白占位」，对比感知体验差异
- 切换「卡片列表」/「文章列表」模块，演示按需加载（lazy chunk）
- 双层骨架：Suspense fallback 用于 JS chunk 下载，组件内部骨架用于数据请求
- 空白加载 vs 骨架屏 多维度对比表（FCP、CLS、焦虑感、成本）
- 代码示例：`React.lazy` 用法、骨架组件 + shimmer 动画 CSS、`manualChunks` 分包、hover 预取

**预期收益**：感知性能大幅提升，CLS 显著改善（不再有内容突然撑开布局）。

---

### 方案三：SSR / 预渲染（`03-ssr-prerender`，端口 5242）

**核心思想**：让浏览器拿到的 HTML 已经包含首屏 DOM，无需等待 JS 下载与执行即可显示内容。
- **SSR（服务端渲染）**：每次请求由 Node 实时渲染首屏 HTML，再由客户端 `hydrateRoot` 接管
- **SSG / 预渲染**：构建期就把首屏 HTML 渲染好作为静态文件，CDN 直接返回

**Demo 看点**：
- 一键切换 CSR / SSR / SSG 三种模式，对比 FCP / LCP / TTI 指标
- 三种模式的加载时间线可视化（HTML 下载、JS 下载、hydrate、关键节点标记）
- 浏览器视角演示：CSR 收到空 #root，SSR/SSG 收到含首屏 DOM 的 HTML
- 预渲染产物 HTML 长什么样：CSR 空壳 vs SSG 含完整 DOM 的对比
- 代码示例：`vite-plugin-prerender` 配置、`vite-plugin-ssr` SSR 入口、`renderToPipeableStream` 流式 SSR、`hydrateRoot` + 避免 hydration mismatch
- CSR vs SSR vs SSG 多维度选型对比表（HTML 体积、FCP/LCP、TTI、SEO、服务器开销、时效性、部署形态、典型场景）

**预期收益**：SSG 的 FCP 几乎等于 HTML 下载时间（CDN 命中 ~100ms），SSR 也能把 FCP 从 900ms+ 降到 200ms 量级；同时改善 SEO。

---

## 运行方式

每个子项目独立运行：

```bash
# 进入任一子目录
cd 01-critical-css   # 或 02-skeleton-screen / 03-ssr-prerender

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查（无需 node_modules 也能通过，因为 src/env.d.ts 提供了 fallback 类型）
npm run type-check

# 构建生产包
npm run build

# 预览生产包
npm run preview
```

各 Demo 的开发端口：
| Demo | 端口 |
| --- | --- |
| 01-critical-css | http://localhost:5240 |
| 02-skeleton-screen | http://localhost:5241 |
| 03-ssr-prerender | http://localhost:5242 |

---

## 类型检查说明

每个子项目的 `src/env.d.ts` 包含了完整的本地类型声明（react / react-dom/client / react/jsx-runtime / vite / @vitejs/plugin-react / CSS 模块 / 静态资源），
作为 `node_modules` 中 `@types/*` 的 fallback。这样在未执行 `npm install` 的情况下，`tsc --noEmit` 也能通过类型检查。

直接在任一子目录执行：

```bash
npx tsc --noEmit
# 或
npm run type-check
```

均可通过。

---

## 方案选型建议

| 场景 | 推荐方案 |
| --- | --- |
| 后台管理系统（无 SEO 需求） | 骨架屏 + 代码分割（方案二） |
| 营销页 / 落地页 / 博客 / 文档（静态内容） | SSG 预渲染 + 关键 CSS（方案三 + 方案一） |
| 电商详情页 / 新闻列表（动态 + SEO） | SSR + 关键 CSS（方案三 + 方案一） |
| 任意项目都适用的基线优化 | 关键 CSS 内联（方案一） |

三种方案并非互斥，实际项目中常常组合使用：
- SSR / SSG 解决「HTML 到达即绘制」
- 关键 CSS 内联解决「CSS 不阻塞首次绘制」
- 骨架屏解决「数据未到时的感知体验」
- 代码分割解决「首屏 JS 体积过大」

---

## 关键指标对照

| 指标 | 含义 | 三种方案的典型提升 |
| --- | --- | --- |
| FCP（First Contentful Paint） | 首次内容绘制 | 关键 CSS：500ms -> 200ms；SSR/SSG：900ms -> 100~200ms |
| LCP（Largest Contentful Paint） | 最大内容绘制 | 同上量级 |
| CLS（Cumulative Layout Shift） | 累计布局偏移 | 骨架屏：显著改善（占位尺寸与真实内容一致） |
| TTI（Time to Interactive） | 可交互时间 | SSR/SSG 不一定改善（仍需 hydrate）；代码分割可改善 |
| INP（Interaction to Next Paint） | 交互响应延迟 | 减少首屏主线程阻塞可改善 |
